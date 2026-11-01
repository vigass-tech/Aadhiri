const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  trackComplaintPublic,
  assignComplaint,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  verifyComplaintImage,
  analyzeCivicImageAI,
  overrideAIAssessment
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public tracking endpoint (no token required)
router.get('/track/:ticketId', trackComplaintPublic);

// Protected routes
router.use(protect);

router.post('/verify-image', verifyComplaintImage);
router.post('/ai-analyze', analyzeCivicImageAI);

router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById)
  .put(authorize('SUPER_ADMIN', 'ADMIN'), updateComplaint)
  .delete(authorize('SUPER_ADMIN'), deleteComplaint);

router.patch('/:id/assign', authorize('SUPER_ADMIN', 'ADMIN'), assignComplaint);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'ADMIN'), updateComplaintStatus);
router.patch('/:id/override-ai', authorize('SUPER_ADMIN', 'ADMIN', 'REVIEWER'), overrideAIAssessment);

module.exports = router;

