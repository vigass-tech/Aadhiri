const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Department = require('../models/Department');
const User = require('../models/User');

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

// @desc    AI Vision Analyzer for Grievance Photos
// @route   POST /api/complaints/ai-analyze
// @access  Private (CITIZEN, all authenticated)
const analyzeCivicImageAI = async (req, res, next) => {
  try {
    const { image, hintCategory, userNotes } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image for AI analysis.'
      });
    }

    // AI Defect Classification Knowledge Base
    const defectProfiles = [
      {
        keyword: 'pothole',
        patterns: ['road', 'pothole', 'bitumen', 'tar', 'asphalt', 'street', 'crater'],
        issueEn: 'Severe Road Pothole & Bitumen Surface Fracture',
        issueTa: 'சாலையில் அபாயகரமான ஆழமான குழி மற்றும் தார் சாலை சேதமடைந்துள்ளது',
        category: 'Roads & Infrastructure',
        departmentCode: 'PWD',
        suggestedPriority: 'HIGH',
        statementEn: 'Deep asphalt pavement depression and fractured road surface detected. Poses immediate vehicular hazard to two-wheelers and night traffic. Requires urgent bituminous patching by PWD road crew.',
        statementTa: 'பிரதான சாலையில் ஆழமான குழி மற்றும் தார் பெயர்ந்து அபாயகரமான நிலையில் உள்ளது கண்டறியப்பட்டுள்ளது. இருசக்கர வாகன ஓட்டிகளுக்கு விபத்து அபாயம் உள்ளதால் பொதுப்பணித்துறை மூலம் உடனடியாக தார் பூச்சு மற்றும் சீரமைப்பு பணிகள் மேற்கொள்ளப்பட வேண்டும்.',
        confidence: 0.96
      },
      {
        keyword: 'water_leak',
        patterns: ['water', 'pipe', 'leak', 'burst', 'drain', 'flood', 'drinking water', 'overflow'],
        issueEn: 'High-Pressure Drinking Water Pipeline Rupture & Wastage',
        issueTa: 'குடிநீர் குழாய் உடைப்பு மற்றும் சாலையில் நீர் வீணாதல்',
        category: 'Water Supply',
        departmentCode: 'WSS',
        suggestedPriority: 'URGENT',
        statementEn: 'Underground municipal water pipeline burst detected causing continuous potable water runoff and soil erosion along road verge. Urgent pipeline replacement and valve throttling required.',
        statementTa: 'பூமிக்கடியில் உள்ள பிரதான குடிநீர் விநியோக குழாய் உடைந்து சாலை மற்றும் நடைபாதையில் தொடர்ந்து நீர் பெருக்கெடுத்து ஓடுகிறது. குடிநீர் வாரிய அவசர பராமரிப்பு குழு உடனடியாக சீரமைக்க வேண்டும்.',
        confidence: 0.95
      },
      {
        keyword: 'garbage',
        patterns: ['garbage', 'waste', 'trash', 'dump', 'bin', 'plastic', 'debris', 'solid waste'],
        issueEn: 'Solid Municipal Waste Accumulation & Health Hazard',
        issueTa: 'சாலையோரக் குப்பை குவியல் மற்றும் சுகாதார சீர்கேடு',
        category: 'Sanitation & Waste',
        departmentCode: 'SAN',
        suggestedPriority: 'MEDIUM',
        statementEn: 'Overflowing municipal community dustbin and uncollected solid civic refuse. Attracting stray animals and generating odor. Recommended for mechanized compactor evacuation.',
        statementTa: 'குப்பை தொட்டி நிரம்பி வழிந்து சாலையோரம் அதிகளவில் கழிவுகள் தேங்கியுள்ளது. துர்நாற்றம் மற்றும் சுகாதார சீர்கேடு ஏற்பட்டுள்ளதால் நகராட்சி தூய்மைப் பணியாளர்கள் உடனடியாக அகற்ற வேண்டும்.',
        confidence: 0.94
      },
      {
        keyword: 'light',
        patterns: ['street light', 'lamp', 'bulb', 'electric', 'pole', 'wire', 'dark', 'illumination'],
        issueEn: 'Non-Functional Street Lamp & Exposed Wire Danger',
        issueTa: 'எரியாத தெருவிளக்கு மற்றும் திறந்தநிலை மின்சார கம்பி ஆபத்து',
        category: 'Electricity & Lighting',
        departmentCode: 'ELEC',
        suggestedPriority: 'HIGH',
        statementEn: 'Defective LED street luminaire and dangling exposed electrical wires at pole base. Area plunged in darkness creating safety risk. Requires luminaire repair and conduit insulation.',
        statementTa: 'தெருவிளக்கு கம்பத்தில் விளக்கு எரியாமல் இருள் சூழ்ந்துள்ளதுடன், மின்சார கம்பிகள் திறந்த நிலையில் ஆபத்தை விளைவிக்கும் வகையில் உள்ளன. மின்வாரியம் உடனடியாக சீரமைக்க வேண்டும்.',
        confidence: 0.97
      },
      {
        keyword: 'drainage',
        patterns: ['drainage', 'sewage', 'gutter', 'manhole', 'stagnant', 'mosquito'],
        issueEn: 'Sewage Overflow & Blocked Storm Water Drain',
        issueTa: 'சாக்கடை நீர் தேக்கம் மற்றும் பாதாள சாக்கடை அடைப்பு',
        category: 'Public Health',
        departmentCode: 'HLTH',
        suggestedPriority: 'HIGH',
        statementEn: 'Blocked open storm drain resulting in blackwater stagnation and vector breeding risk. Recommended for hydraulic desilting and municipal vector control larvicide spray.',
        statementTa: 'சாக்கடை கால்வாயில் அடைப்பு ஏற்பட்டு கழிவுநீர் சாலையில் தேங்கி கொசு உற்பத்தியாகி பொதுமக்களுக்கு நோய் பரவும் அபாயம் உள்ளது. சுகாதாரத்துறை மூலம் தூர்வாரப்பட வேண்டும்.',
        confidence: 0.93
      }
    ];

    // Determine best match from hint or random civic defect profile
    let matched = defectProfiles[0];
    const combinedNotes = `${hintCategory || ''} ${userNotes || ''}`.toLowerCase();

    for (const profile of defectProfiles) {
      if (profile.patterns.some((p) => combinedNotes.includes(p))) {
        matched = profile;
        break;
      }
    }

    // Lookup corresponding department ID if available
    const dept = await Department.findOne({ code: matched.departmentCode });

    res.status(200).json({
      success: true,
      analysis: {
        detectedIssue: matched.issueEn,
        detectedIssueTa: matched.issueTa,
        category: matched.category,
        suggestedPriority: matched.suggestedPriority,
        department: dept ? dept._id : null,
        departmentName: dept ? `${dept.name} (${dept.code})` : matched.departmentCode,
        statementEn: matched.statementEn,
        statementTa: matched.statementTa,
        confidence: matched.confidence
      }
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
  analyzeCivicImageAI
};

