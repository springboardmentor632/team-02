const express = require('express');
const Feedback = require('../models/feedback');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const entry = await Feedback.create(req.body);
    res.status(201).json({ feedback: entry });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ feedback: item });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
