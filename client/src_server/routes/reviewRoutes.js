const express = require('express');
const router = express.Router();
const {
  submitReview,
  getComplaintReviews,
  getReviewerHistory
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/:complaintId', authorize('REVIEWER', 'ADMIN', 'SUPER_ADMIN'), submitReview);
router.get('/:complaintId/history', getComplaintReviews);
router.get('/history/all', authorize('REVIEWER'), getReviewerHistory);

module.exports = router;

