const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Department = require('../models/Department');
const User = require('../models/User');
const { verifyCivicImage } = require('../utils/aiVisionService');

// Helper to generate a unique Ticket ID
const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  const ticketId = `ADH-${year}-${randomSuffix}`;

  // Ensure uniqueness
  const exists = await Complaint.findOne({ ticketId });
  if (exists) {
    return generateTicketId();
  }
  return ticketId;
};

// @desc    Raise a new complaint
// @route   POST /api/complaints
// @access  Private (CITIZEN)
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      department,
      location,
      address,
      priority,
      attachments,
      coordinates,
      aiAnalysis
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: title, description, category, location.'
      });
    }

    const ticketId = await generateTicketId();

    const initialHistory = {
      previousStatus: '',
      newStatus: 'SUBMITTED',
      updatedBy: req.user._id,
      userRole: req.user.role,
      remarks: 'Complaint registered successfully by citizen.',
      timestamp: new Date()
    };

    const complaint = await Complaint.create({
      ticketId,
      citizen: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      department: department || null,
      priority: priority || 'MEDIUM',
      status: 'SUBMITTED',
      location: location.trim(),
      address: address ? address.trim() : '',
      coordinates: coordinates || null,
      aiAnalysis: aiAnalysis || null,
      attachments: attachments || [],
      statusHistory: [initialHistory]
    });

    // Create in-app confirmation notification for the citizen
    await Notification.create({
      recipient: req.user._id,
      title: 'Complaint Registered Successfully',
      message: `Your complaint "${complaint.title}" has been registered with Ticket ID ${ticketId}. Our officers will review it shortly.`,
      type: 'COMPLAINT_SUBMITTED',
      relatedComplaint: complaint._id
    });

    // Requirement 6: For HIGH and CRITICAL issues, notify Admins for immediate emergency triage
    if (['HIGH', 'CRITICAL', 'URGENT'].includes(complaint.priority)) {
      try {
        const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            title: `🚨 Emergency Grievance Alert (${complaint.priority})`,
            message: `Ticket ${ticketId} [${complaint.category}] has been flagged as ${complaint.priority} severity at ${complaint.location}. Immediate inspection recommended.`,
            type: 'EMERGENCY_ESCALATION',
            relatedComplaint: complaint._id
          });
        }
      } catch (notifErr) {
        console.warn('Failed to send admin escalation notification:', notifErr.message);
      }
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      ticketId,
      complaint: populatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with role-based scoping and filters
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      department,
      priority,
      category,
      search,
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // 1. Role-based scoping
    if (req.user.role === 'CITIZEN') {
      // Citizen only sees their own
      query.citizen = req.user._id;
    } else if (req.user.role === 'REVIEWER') {
      // Reviewer only sees assigned
      query.assignedReviewer = req.user._id;
    } else if (req.user.role === 'ADMIN') {
      // If admin has assigned departments and no specific dept requested, scope to those
      if (req.user.assignedDepartments && req.user.assignedDepartments.length > 0) {
        query.department = { $in: req.user.assignedDepartments };
      }
    }
    // SUPER_ADMIN sees all complaints without automatic restriction

    // 2. Query filters
    if (status) {
      query.status = status;
    }
    if (department) {
      query.department = department;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('citizen', 'name email phone address')
      .populate('department', 'name code')
      .populate('assignedReviewer', 'name email designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone address')
      .populate('department')
      .populate('assignedReviewer', 'name email designation phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Role verification
    if (req.user.role === 'CITIZEN' && complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own complaints.'
      });
    }

    if (
      req.user.role === 'REVIEWER' &&
      (!complaint.assignedReviewer ||
        complaint.assignedReviewer._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view complaints assigned to you.'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public Track Complaint by Ticket ID (No login required)
// @route   GET /api/complaints/track/:ticketId
// @access  Public
const trackComplaintPublic = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Please provide a Ticket ID.' });
    }

    const complaint = await Complaint.findOne({
      ticketId: ticketId.trim().toUpperCase()
    })
      .populate('department', 'name code')
      .populate('statusHistory.updatedBy', 'role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with Ticket ID "${ticketId.toUpperCase()}". Please verify the ID and try again.`
      });
    }

    // Return public-safe progress information
    const publicData = {
      ticketId: complaint.ticketId,
      title: complaint.title,
      category: complaint.category,
      department: complaint.department ? complaint.department.name : 'Pending Department Assignment',
      status: complaint.status,
      priority: complaint.priority,
      location: complaint.location,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      reviewRemarks: complaint.reviewRemarks || null,
      resolutionRemarks: complaint.resolutionRemarks || null,
      timeline: complaint.statusHistory.map((h) => ({
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        remarks: h.remarks,
        timestamp: h.timestamp,
        role: h.userRole
      }))
    };

    res.status(200).json({
      success: true,
      complaint: publicData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign Department and/or Reviewer to Complaint
// @route   PATCH /api/complaints/:id/assign
// @access  Private (SUPER_ADMIN, ADMIN)
const assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, reviewerId, remarks, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const previousStatus = complaint.status;
    let newStatus = complaint.status;

    if (departmentId) {
      complaint.department = departmentId;
    }

    if (reviewerId) {
      complaint.assignedReviewer = reviewerId;
      newStatus = 'UNDER_REVIEW'; // Moves to UNDER_REVIEW when reviewer is assigned
    } else if (departmentId && complaint.status === 'SUBMITTED') {
      newStatus = 'ASSIGNED';
    }

    if (priority) {
      complaint.priority = priority;
    }

    complaint.status = newStatus;

    const historyEntry = {
      previousStatus,
      newStatus,
      updatedBy: req.user._id,
      userRole: req.user.role,
      remarks: remarks || `Assigned by ${req.user.name} (${req.user.role}).`,
      timestamp: new Date()
    };
    complaint.statusHistory.push(historyEntry);

    await complaint.save();

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: 'Complaint Assigned',
      message: `Your complaint (${complaint.ticketId}) status has been updated to "${newStatus}".`,
      type: 'COMPLAINT_ASSIGNED',
      relatedComplaint: complaint._id
    });

    // Notify Reviewer if assigned
    if (reviewerId) {
      await Notification.create({
        recipient: reviewerId,
        title: 'New Complaint Assigned for Review',
        message: `Complaint ${complaint.ticketId}: "${complaint.title}" has been assigned to you for inspection and review.`,
        type: 'COMPLAINT_ASSIGNED',
        relatedComplaint: complaint._id
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('department')
      .populate('assignedReviewer', 'name designation email');

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Complaint Status & Progress (Workflow engine)
// @route   PATCH /api/complaints/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks, resolutionRemarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status.' });
    }

    const validStatuses = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    if (resolutionRemarks) {
      complaint.resolutionRemarks = resolutionRemarks;
    }

    complaint.statusHistory.push({
      previousStatus,
      newStatus: status,
      updatedBy: req.user._id,
      userRole: req.user.role,
      remarks: remarks || `Status changed from ${previousStatus} to ${status}.`,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify Citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: `Complaint Status: ${status}`,
      message: `Your complaint (${complaint.ticketId}) is now "${status}". ${remarks ? 'Note: ' + remarks : ''}`,
      type: 'COMPLAINT_STATUS',
      relatedComplaint: complaint._id
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('department')
      .populate('assignedReviewer', 'name designation');

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint details
// @route   PUT /api/complaints/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateComplaint = async (req, res, next) => {
  try {
    const { title, description, category, department, priority, location, address } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (category) complaint.category = category;
    if (department) complaint.department = department;
    if (priority) complaint.priority = priority;
    if (location) complaint.location = location.trim();
    if (address !== undefined) complaint.address = address;

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (SUPER_ADMIN)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    await Complaint.findByIdAndDelete(complaint._id);

    res.status(200).json({
      success: true,
      message: `Complaint ${complaint.ticketId} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and classify civic grievance photo using AI / Machine Learning
// @route   POST /api/complaints/verify-image or POST /api/complaints/ai-analyze
// @access  Private (All authenticated users)
const verifyComplaintImage = async (req, res, next) => {
  try {
    const { image, hintCategory, userNotes, isDocument } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image payload for AI verification.'
      });
    }

    // Call Multi-Task Civic Verification & Severity Triage Service
    const analysis = await verifyCivicImage(image, hintCategory, userNotes, { isDocument });

    // Lookup corresponding department ID in MongoDB
    let dept = null;
    if (analysis.departmentCode) {
      dept = await Department.findOne({ code: analysis.departmentCode });
    }

    res.status(200).json({
      success: true,
      analysis: {
        isValidCivicIssue: analysis.isValidCivicIssue !== false,
        supported: analysis.supported !== false,
        category: analysis.category,
        severity: analysis.severity,
        priority: analysis.priority || analysis.severity,
        isAiEstimated: Boolean(analysis.isAiEstimated),
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        recommendedAction: analysis.recommendedAction,
        detectedIssue: analysis.detectedIssue || analysis.category,
        detectedIssueTa: analysis.detectedIssueTa || analysis.detectedIssue || analysis.category,
        message: analysis.message || null,
        statementEn: analysis.statementEn || analysis.explanation || '',
        statementTa: analysis.statementTa || '',
        boundingBoxes: analysis.boundingBoxes || [],
        department: dept ? dept._id : null,
        departmentName: dept ? `${dept.name} (${dept.code})` : analysis.departmentName,
        isLowConfidence: Boolean(analysis.isLowConfidence),
        requiresManualReview: Boolean(analysis.requiresManualReview),
        aiProvider: analysis.aiProvider || 'Civic Eye YOLOv8 (Hugging Face tanmay9132)'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff override for AI assessment (Human-in-the-Loop Review)
// @route   PATCH /api/complaints/:id/override-ai
// @access  Private (SUPER_ADMIN, ADMIN, REVIEWER)
const overrideAIAssessment = async (req, res, next) => {
  try {
    const { verifiedCategory, verifiedSeverity, reviewNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (!verifiedCategory || !verifiedSeverity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both verifiedCategory and verifiedSeverity.'
      });
    }

    // Save human override while preserving original AI prediction
    complaint.humanReview = {
      isOverridden: true,
      verifiedCategory,
      verifiedSeverity,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes ? reviewNotes.trim() : ''
    };

    // Update active category and priority
    complaint.category = verifiedCategory;
    complaint.priority = verifiedSeverity;

    // Record in timeline history
    complaint.statusHistory.push({
      previousStatus: complaint.status,
      newStatus: complaint.status,
      updatedBy: req.user._id,
      userRole: req.user.role,
      remarks: `Human Verification Override: Category set to "${verifiedCategory}", Severity set to "${verifiedSeverity}". Notes: ${reviewNotes || 'None'}`,
      timestamp: new Date()
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .populate('assignedReviewer', 'name email')
      .populate('humanReview.reviewedBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Human verification and override recorded successfully.',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  trackComplaintPublic,
  assignComplaint,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  verifyComplaintImage,
  analyzeCivicImageAI: verifyComplaintImage, // backwards compatible alias
  overrideAIAssessment
};

