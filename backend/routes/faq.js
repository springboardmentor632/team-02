const express = require('express');
const FAQ = require('../models/faq');
const Feedback = require('../models/feedback');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/faqs - Fetch FAQs
router.get('/', async (req, res, next) => {
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
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const faqs = await FAQ.find(filter).sort({ helpfulCount: -1, createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    next(err);
  }
});

// GET /api/faqs/admin - Fetch all FAQs (including drafts for Officers/Admins)
router.get('/admin', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs - Create FAQ (Officer/Admin)
router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const faq = await FAQ.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ faq });
  } catch (err) {
    next(err);
  }
});

// PUT /api/faqs/:id - Edit FAQ (Officer/Admin)
router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    res.json({ faq });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/faqs/:id - Delete FAQ (Officer/Admin)
router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs/:id/vote - Upvote or Downvote FAQ
router.post('/:id/vote', async (req, res, next) => {
  try {
    const { type } = req.body; // 'helpful' or 'unhelpful'
    const update = type === 'helpful' ? { $inc: { helpfulCount: 1 } } : { $inc: { unhelpfulCount: 1 } };
    const faq = await FAQ.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ faq });
  } catch (err) {
    next(err);
  }
});

// POST /api/faqs/convert-query - Convert Query/Ticket into published FAQ
router.post('/convert-query', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const { queryId, question, answer, category, targetRole } = req.body;
    
    // Create new FAQ
    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      targetRole: targetRole || 'All',
      isPublished: true,
      createdBy: req.user._id
    });

    // Optionally mark the feedback query as resolved
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
