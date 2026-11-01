const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const Budget = require('../models/Budget');
const Review = require('../models/Review');

// @desc    Get public portal statistics for landing page
// @route   GET /api/dashboard/public-stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({
      status: { $in: ['RESOLVED', 'CLOSED'] }
    });
    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] }
    });
    const registeredCitizens = await User.countDocuments({ role: 'CITIZEN' });
    const totalDepartments = await Department.countDocuments({ isActive: true });

    // Category counts for landing page
    const categoriesAggregation = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        registeredCitizens,
        totalDepartments,
        resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100,
        categories: categoriesAggregation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Super Admin Dashboard metrics & charts
// @route   GET /api/dashboard/super-admin
// @access  Private (SUPER_ADMIN)
const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const totalCitizens = await User.countDocuments({ role: 'CITIZEN' });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
    const totalReviewers = await User.countDocuments({ role: 'REVIEWER' });
    const totalDepartments = await Department.countDocuments();

    const pendingComplaints = await Complaint.countDocuments({ status: 'SUBMITTED' });
    const inReviewComplaints = await Complaint.countDocuments({
      status: { $in: ['UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] }
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: { $in: ['RESOLVED', 'CLOSED'] }
    });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'REJECTED' });

    // Budget overview
    const budgets = await Budget.find();
    const budgetOverview = budgets.reduce(
      (acc, b) => {
        acc.totalAllocated += b.allocatedAmount || 0;
        acc.totalUtilized += b.utilizedAmount || 0;
        acc.totalRemaining += b.remainingAmount || 0;
        return acc;
      },
      { totalAllocated: 0, totalUtilized: 0, totalRemaining: 0 }
    );

    // Complaints by status aggregation
    const statusAggregation = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Complaints by department aggregation
    const deptAggregation = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      {
        $project: {
          name: {
            $ifNull: [{ $arrayElemAt: ['$deptInfo.name', 0] }, 'Unassigned']
          },
          count: 1,
          resolved: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Priority breakdown
    const priorityAggregation = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Monthly complaints trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthlyAggregation.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      complaints: item.count,
      resolved: item.resolved
    }));

    // Recent 10 complaints
    const recentComplaints = await Complaint.find()
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      metrics: {
        totalComplaints,
        totalCitizens,
        totalAdmins,
        totalReviewers,
        totalDepartments,
        pendingComplaints,
        inReviewComplaints,
        resolvedComplaints,
        rejectedComplaints,
        budgetOverview
      },
      charts: {
        statusBreakdown: statusAggregation.map((s) => ({ status: s._id, count: s.count })),
        departmentPerformance: deptAggregation,
        priorityBreakdown: priorityAggregation.map((p) => ({ priority: p._id, count: p.count })),
        monthlyTrends
      },
      recentComplaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard metrics & charts
// @route   GET /api/dashboard/admin
// @access  Private (ADMIN)
const getAdminDashboard = async (req, res, next) => {
  try {
    const scopeQuery = {};
    if (req.user.assignedDepartments && req.user.assignedDepartments.length > 0) {
      scopeQuery.department = { $in: req.user.assignedDepartments };
    }

    const totalComplaints = await Complaint.countDocuments(scopeQuery);
    const pendingComplaints = await Complaint.countDocuments({ ...scopeQuery, status: 'SUBMITTED' });
    const assignedComplaints = await Complaint.countDocuments({
      ...scopeQuery,
      status: { $in: ['ASSIGNED', 'UNDER_REVIEW', 'IN_PROGRESS'] }
    });
    const resolvedComplaints = await Complaint.countDocuments({
      ...scopeQuery,
      status: { $in: ['RESOLVED', 'CLOSED'] }
    });
    const rejectedComplaints = await Complaint.countDocuments({ ...scopeQuery, status: 'REJECTED' });

    const totalReviewers = await User.countDocuments({ role: 'REVIEWER' });
    const totalCitizens = await User.countDocuments({ role: 'CITIZEN' });

    // Status breakdown
    const statusAggregation = await Complaint.aggregate([
      { $match: scopeQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const priorityAggregation = await Complaint.aggregate([
      { $match: scopeQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent complaints
    const recentComplaints = await Complaint.find(scopeQuery)
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      metrics: {
        totalComplaints,
        pendingComplaints,
        assignedComplaints,
        resolvedComplaints,
        rejectedComplaints,
        totalReviewers,
        totalCitizens
      },
      charts: {
        statusBreakdown: statusAggregation.map((s) => ({ status: s._id, count: s.count })),
        priorityBreakdown: priorityAggregation.map((p) => ({ priority: p._id, count: p.count }))
      },
      recentComplaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Reviewer Dashboard metrics
// @route   GET /api/dashboard/reviewer
// @access  Private (REVIEWER)
const getReviewerDashboard = async (req, res, next) => {
  try {
    const assignedTotal = await Complaint.countDocuments({
      assignedReviewer: req.user._id
    });
    const pendingReviews = await Complaint.countDocuments({
      assignedReviewer: req.user._id,
      status: { $in: ['UNDER_REVIEW', 'ASSIGNED'] }
    });
    const approvedCount = await Complaint.countDocuments({
      assignedReviewer: req.user._id,
      status: { $in: ['APPROVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }
    });
    const rejectedCount = await Complaint.countDocuments({
      assignedReviewer: req.user._id,
      status: 'REJECTED'
    });
    const totalReviewsCompleted = await Review.countDocuments({
      reviewer: req.user._id
    });

    const assignedComplaints = await Complaint.find({
      assignedReviewer: req.user._id
    })
      .populate('citizen', 'name phone email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({
      success: true,
      metrics: {
        totalAssigned: assignedTotal,
        pendingReviews,
        approvedComplaints: approvedCount,
        rejectedComplaints: rejectedCount,
        totalReviewsCompleted
      },
      assignedComplaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Citizen Dashboard metrics
// @route   GET /api/dashboard/citizen
// @access  Private (CITIZEN)
const getCitizenDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments({ citizen: req.user._id });
    const pendingComplaints = await Complaint.countDocuments({
      citizen: req.user._id,
      status: 'SUBMITTED'
    });
    const inReviewComplaints = await Complaint.countDocuments({
      citizen: req.user._id,
      status: { $in: ['UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] }
    });
    const resolvedComplaints = await Complaint.countDocuments({
      citizen: req.user._id,
      status: { $in: ['RESOLVED', 'CLOSED'] }
    });
    const rejectedComplaints = await Complaint.countDocuments({
      citizen: req.user._id,
      status: 'REJECTED'
    });

    const recentComplaints = await Complaint.find({ citizen: req.user._id })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalComplaints,
        pendingComplaints,
        inReviewComplaints,
        resolvedComplaints,
        rejectedComplaints
      },
      recentComplaints
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
  getSuperAdminDashboard,
  getAdminDashboard,
  getReviewerDashboard,
  getCitizenDashboard
};

