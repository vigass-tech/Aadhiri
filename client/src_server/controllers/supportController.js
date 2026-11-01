const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

// Helper to generate unique support ticket ID
const generateSupportTicketId = async () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `SUP-${year}-${randomSuffix}`;
  const exists = await SupportTicket.findOne({ ticketId });
  if (exists) return generateSupportTicketId();
  return ticketId;
};

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private (CITIZEN, all authenticated)
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, description, and category.'
      });
    }

    const ticketId = await generateSupportTicketId();

    const ticket = await SupportTicket.create({
      ticketId,
      citizen: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
      category: category.trim(),
      status: 'OPEN'
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get support tickets
// @route   GET /api/support
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (req.user.role === 'CITIZEN') {
      query.citizen = req.user._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('citizen', 'name email phone')
      .populate('responses.sender', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single support ticket
// @route   GET /api/support/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('responses.sender', 'name role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    if (
      req.user.role === 'CITIZEN' &&
      ticket.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own support tickets.'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to a support ticket
// @route   POST /api/support/:id/respond
// @access  Private
const respondToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Response message cannot be empty.'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    // Role check: citizen can only respond to their own tickets
    if (
      req.user.role === 'CITIZEN' &&
      ticket.citizen.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only respond to your own tickets.'
      });
    }

    ticket.responses.push({
      sender: req.user._id,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date()
    });

    // If an admin/super admin responds, automatically set status to IN_PROGRESS if OPEN
    if (
      (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') &&
      ticket.status === 'OPEN'
    ) {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    // If staff responded, notify citizen
    if (req.user.role !== 'CITIZEN') {
      await Notification.create({
        recipient: ticket.citizen,
        title: 'Support Ticket Update',
        message: `Our support team has replied to your ticket "${ticket.ticketId}".`,
        type: 'SUPPORT_UPDATE'
      });
    }

    const updated = await SupportTicket.findById(ticket._id)
      .populate('citizen', 'name email')
      .populate('responses.sender', 'name role');

    res.status(200).json({
      success: true,
      message: 'Response added successfully.',
      ticket: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update support ticket status
// @route   PATCH /api/support/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (!valid.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${valid.join(', ')}`
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.status = status;
    await ticket.save();

    // Notify citizen
    await Notification.create({
      recipient: ticket.citizen,
      title: `Support Ticket ${status}`,
      message: `Your support ticket "${ticket.ticketId}" has been marked as ${status}.`,
      type: 'SUPPORT_UPDATE'
    });

    res.status(200).json({
      success: true,
      message: `Support ticket marked as ${status}.`,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  respondToTicket,
  updateTicketStatus
};

