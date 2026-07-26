const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const SearchHistory = require('../models/searchHistory');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { query, category, ministry, state, department, status, startDate, endDate } = req.body;
    const filters = {};
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ];
    }
    if (category) filters.category = category;
    if (ministry) filters.ministry = ministry;
    if (state) filters.state = state;
    if (department) filters.department = department;
    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.publishedAt = {};
      if (startDate) filters.publishedAt.$gte = new Date(startDate);
      if (endDate) filters.publishedAt.$lte = new Date(endDate);
    }

    const policies = await Policy.find(filters).sort({ publishedAt: -1 });
    const schemes = await Scheme.find({
      ...(query ? { $or: [{ name: { $regex: query, $options: 'i' } }, { summary: { $regex: query, $options: 'i' } }, { details: { $regex: query, $options: 'i' } }] } : {}),
      ...(category ? { category } : {}),
      ...(ministry ? { ministry } : {}),
      ...(state ? { state } : {}),
      ...(status ? { status } : {}),
    }).sort({ launchDate: -1 });

    await SearchHistory.create({ user: req.user._id, query, filters, resultsCount: policies.length + schemes.length });

    res.json({ policies, schemes });
  } catch (err) {
    next(err);
  }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ searchedAt: -1 })
      .limit(10);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
