const express = require('express');
const FAQ = require('../models/faq');
const Feedback = require('../models/feedback');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/faqs - Fetch all public FAQs for all Citizens and Administrators
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, role, search } = req.query;
    let filter = { isPublished: true };

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (role && role !== 'All') {
      filter.targetRole = { $in: ['All', role] };
    }
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { askedByName: { $regex: search, $options: 'i' } }
      ];
    }

    const faqs = await FAQ.find(filter)
      .populate('createdBy', 'firstName lastName role')
      .populate('messages.sender', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json({ faqs });
  } catch (err) {
    next(err);
  }
});

// GET /api/faqs/admin - Fetch all FAQs including drafts for Officers/Admins
router.get('/admin', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const faqs = await FAQ.find()
      .populate('createdBy', 'firstName lastName role')
      .populate('messages.sender', 'firstName lastName role')
      .sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs - Create a public FAQ/Question (Allowed for Citizens & Admins)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { question, answer, category, targetRole, isPublished } = req.body;
    const isOfficer = ['Administrator', 'Government Official'].includes(req.user.role);
    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
    const senderRole = req.user.role || 'Citizen';

    const defaultAnswer = answer && answer.trim() ? answer.trim() : (isOfficer ? 'Official response pending.' : 'Awaiting official administrator response...');

    const initialMessages = [
      {
        sender: req.user._id,
        senderName: senderName,
        senderRole: senderRole,
        message: question
      }
    ];

    if (answer && answer.trim() && isOfficer) {
      initialMessages.push({
        sender: req.user._id,
        senderName: senderName,
        senderRole: senderRole,
        message: answer.trim()
      });
    }

    const faq = await FAQ.create({
      question,
      answer: defaultAnswer,
      category: category || 'General',
      targetRole: targetRole || 'All',
      isPublished: isPublished !== false,
      askedByName: senderName,
      askedByRole: senderRole,
      createdBy: req.user._id,
      messages: initialMessages
    });

    const populated = await FAQ.findById(faq._id)
      .populate('createdBy', 'firstName lastName role')
      .populate('messages.sender', 'firstName lastName role');

    res.status(201).json({ faq: populated });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs/:id/messages - Real chat message reply between Citizen & Administrator
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
    const senderRole = req.user.role || 'Citizen';
    const isOfficer = ['Administrator', 'Government Official'].includes(req.user.role);

    const newMessage = {
      sender: req.user._id,
      senderName: senderName,
      senderRole: senderRole,
      message: message.trim(),
      createdAt: new Date()
    };

    faq.messages.push(newMessage);

    // If an Administrator/Officer replies, update the primary answer field of the FAQ
    if (isOfficer) {
      faq.answer = message.trim();
      faq.updatedBy = req.user._id;
    }

    await faq.save();

    const updated = await FAQ.findById(req.params.id)
      .populate('createdBy', 'firstName lastName role')
      .populate('messages.sender', 'firstName lastName role');

    res.json({ faq: updated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/faqs/:id - Edit FAQ (Administrator/Officer)
router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    ).populate('messages.sender', 'firstName lastName role');
    res.json({ faq });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/faqs/:id - Delete FAQ (Administrator/Officer)
router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs/:id/vote - Upvote or Downvote FAQ
router.post('/:id/vote', authenticate, async (req, res, next) => {
  try {
    const { type } = req.body;
    const update = type === 'helpful' ? { $inc: { helpfulCount: 1 } } : { $inc: { unhelpfulCount: 1 } };
    const faq = await FAQ.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ faq });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs/convert-query - Convert Query/Ticket into published FAQ with thread history
router.post('/convert-query', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const { queryId, question, answer, category, targetRole } = req.body;
    let initialMessages = [];

    if (queryId) {
      const existingTicket = await Feedback.findById(queryId);
      if (existingTicket && existingTicket.messages && existingTicket.messages.length > 0) {
        initialMessages = existingTicket.messages.map(m => ({
          sender: m.sender,
          senderName: m.senderName,
          senderRole: m.senderRole,
          message: m.message,
          createdAt: m.createdAt
        }));
      }
    }

    if (initialMessages.length === 0) {
      initialMessages.push({
        sender: req.user._id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        senderRole: req.user.role,
        message: question
      });
      if (answer) {
        initialMessages.push({
          sender: req.user._id,
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          senderRole: req.user.role,
          message: answer
        });
      }
    }

    const faq = await FAQ.create({
      question,
      answer: answer || 'Resolved by official response.',
      category: category || 'General',
      targetRole: targetRole || 'All',
      isPublished: true,
      askedByName: 'Citizen',
      askedByRole: 'Citizen',
      createdBy: req.user._id,
      messages: initialMessages
    });

    if (queryId) {
      await Feedback.findByIdAndUpdate(queryId, {
        status: 'Resolved',
        response: answer,
        respondedBy: req.user._id,
        respondedAt: new Date()
      });
    }

    res.status(201).json({ message: 'Query converted to FAQ successfully', faq });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
