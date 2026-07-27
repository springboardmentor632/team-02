const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const SearchHistory = require('../models/searchHistory');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { query, category, ministry, state, department, status, statuses, startDate, endDate } = req.body;

    // Build policy filters
    const policyFilters = {};
    if (query) {
      policyFilters.$or = [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ];
    }
    if (category && category !== 'All Categories') policyFilters.category = category;
    if (ministry) policyFilters.ministry = ministry;
    if (state && state !== 'All States' && state !== 'All India') policyFilters.state = state;
    if (department) policyFilters.department = department;

    // Support multiple statuses array OR single status string
    if (statuses && Array.isArray(statuses) && statuses.length > 0) {
      policyFilters.status = { $in: statuses };
    } else if (status) {
      policyFilters.status = status;
    }

    if (startDate || endDate) {
      policyFilters.publishedAt = {};
      if (startDate) policyFilters.publishedAt.$gte = new Date(startDate);
      if (endDate) policyFilters.publishedAt.$lte = new Date(endDate);
    }

    // Build scheme filters
    const schemeFilters = {};
    if (query) {
      schemeFilters.$or = [
        { name: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { details: { $regex: query, $options: 'i' } },
      ];
    }
    if (category && category !== 'All Categories') schemeFilters.category = category;
    if (ministry) schemeFilters.ministry = ministry;
    if (state && state !== 'All States' && state !== 'All India') schemeFilters.state = state;

    if (statuses && Array.isArray(statuses) && statuses.length > 0) {
      schemeFilters.status = { $in: statuses };
    } else if (status) {
      schemeFilters.status = status;
    }

    const [policies, schemes] = await Promise.all([
      Policy.find(policyFilters).sort({ publishedAt: -1 }),
      Scheme.find(schemeFilters).sort({ launchDate: -1 }),
    ]);

    // Only save to history if a query was provided
    if (query && query.trim()) {
      try {
        await SearchHistory.create({
          user: req.user._id,
          query: query.trim(),
          filters: { category, ministry, state, status },
          resultsCount: policies.length + schemes.length,
        });
      } catch (_) {
        // non-fatal: don't fail the search if history save fails
      }
    }

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
