const express = require('express');
const Feedback = require('../models/feedback');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role !== 'Administrator' && req.user.role !== 'Government Official') {
      filter = { $or: [{ user: req.user._id }, { email: req.user.email }] };
    }
    const feedback = await Feedback.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const entry = await Feedback.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json({ feedback: entry });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const { status, response } = req.body;
    const item = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    );
    res.json({ feedback: item });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
