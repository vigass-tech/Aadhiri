const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getSuperAdminDashboard,
  getAdminDashboard,
  getReviewerDashboard,
  getCitizenDashboard
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public stats for landing page
router.get('/public-stats', getPublicStats);

// Protected role-based dashboard endpoints
router.get('/super-admin', protect, authorize('SUPER_ADMIN'), getSuperAdminDashboard);
router.get('/admin', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAdminDashboard);
router.get('/reviewer', protect, authorize('REVIEWER'), getReviewerDashboard);
router.get('/citizen', protect, authorize('CITIZEN'), getCitizenDashboard);

module.exports = router;

