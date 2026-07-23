const express = require('express');
const Scheme = require('../models/scheme');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.ministry) filters.ministry = req.query.ministry;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.q) filters.name = { $regex: req.query.q, $options: 'i' };

    const schemes = await Scheme.find(filters).sort({ launchDate: -1 });
    res.json({ schemes });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const scheme = await Scheme.create({
      ...req.body,
      author: req.user._id,
      status: req.body.status || 'Draft',
    });
    res.status(201).json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scheme deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
