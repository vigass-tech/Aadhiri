const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit review for a complaint
// @route   POST /api/reviews/:complaintId
// @access  Private (REVIEWER, ADMIN, SUPER_ADMIN)
const submitReview = async (req, res, next) => {
  try {
    const { decision, remarks, rejectionReason, recommendation } = req.body;
    const { complaintId } = req.params;

    if (!decision || !remarks) {
      return res.status(400).json({
        success: false,
        message: 'Please provide decision (APPROVED, REJECTED, RECOMMENDED_ACTION) and remarks.'
      });
    }

    if (decision === 'REJECTED' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory rejection reason must be provided when rejecting a complaint.'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // If reviewer, ensure it is assigned to them
    if (
      req.user.role === 'REVIEWER' &&
      (!complaint.assignedReviewer ||
        complaint.assignedReviewer.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only review complaints assigned to you.'
      });
    }

    // Create Review record
    const review = await Review.create({
      complaint: complaint._id,
      reviewer: req.user._id,
      decision,
      remarks: remarks.trim(),
      rejectionReason: rejectionReason ? rejectionReason.trim() : '',
      recommendation: recommendation ? recommendation.trim() : '',
      reviewedAt: new Date()
    });

    // Determine new status for complaint
    const previousStatus = complaint.status;
    let newStatus = complaint.status;

    if (decision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (decision === 'REJECTED') {
      newStatus = 'REJECTED';
    } else if (decision === 'RECOMMENDED_ACTION') {
      newStatus = 'IN_PROGRESS';
    }

    complaint.status = newStatus;
    complaint.reviewRemarks = remarks.trim();
    if (rejectionReason) {
      complaint.rejectionReason = rejectionReason.trim();
    }

    // Append to complaint status history
    complaint.statusHistory.push({
      previousStatus,
      newStatus,
      updatedBy: req.user._id,
      userRole: req.user.role,
      remarks: `Review completed (${decision}): ${remarks.trim()}`,
      timestamp: new Date()
    });

    await complaint.save();

    // 1. Notify the citizen
    await Notification.create({
      recipient: complaint.citizen,
      title: `Complaint Review Decision: ${decision}`,
      message: `Your complaint (${complaint.ticketId}) was evaluated by our inspector. Decision: ${decision}. Remarks: ${remarks}`,
      type: 'COMPLAINT_REVIEWED',
      relatedComplaint: complaint._id
    });

    // 2. Notify Admins
    const admins = await User.find({
      role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
      isActive: true
    }).select('_id');

    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: `Complaint ${complaint.ticketId} Reviewed`,
        message: `Reviewer ${req.user.name} marked complaint ${complaint.ticketId} as ${decision}.`,
        type: 'COMPLAINT_REVIEWED',
        relatedComplaint: complaint._id
      });
    }

    const populatedReview = await Review.findById(review._id).populate(
      'reviewer',
      'name designation email'
    );

    res.status(201).json({
      success: true,
      message: `Review submitted successfully. Complaint status updated to ${newStatus}.`,
      review: populatedReview,
      complaintStatus: newStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a complaint
// @route   GET /api/reviews/:complaintId/history
// @access  Private
const getComplaintReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ complaint: req.params.complaintId })
      .populate('reviewer', 'name designation email')
      .sort({ reviewedAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews performed by current reviewer
// @route   GET /api/reviews/history
// @access  Private (REVIEWER)
const getReviewerHistory = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate({
        path: 'complaint',
        populate: [{ path: 'department', select: 'name code' }, { path: 'citizen', select: 'name phone' }]
      })
      .sort({ reviewedAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getComplaintReviews,
  getReviewerHistory
};

