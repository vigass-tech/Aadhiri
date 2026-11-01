const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  respondToTicket,
  updateTicketStatus
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getTickets);

router.route('/:id')
  .get(getTicketById);

router.post('/:id/respond', respondToTicket);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'ADMIN'), updateTicketStatus);

module.exports = router;

