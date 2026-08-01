const express = require('express');
const jwt = require('jsonwebtoken');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const SearchHistory = require('../models/searchHistory');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const getAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

router.post('/', async (req, res, next) => {
  try {
    const { query, category, ministry, state, department, status, statuses, startDate, endDate } = req.body;
    const searchTerm = typeof query === 'string' ? query.trim() : '';

    // Build policy filters
    const policyFilters = {};
    if (searchTerm) {
      policyFilters.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { summary: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { ministry: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
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
    if (searchTerm) {
      schemeFilters.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { summary: { $regex: searchTerm, $options: 'i' } },
        { details: { $regex: searchTerm, $options: 'i' } },
        { ministry: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
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

    const user = await getAuthenticatedUser(req);
    req.user = user;

    const [policies, schemes] = await Promise.all([
      Policy.find(policyFilters).sort({ publishedAt: -1 }),
      Scheme.find(schemeFilters).sort({ launchDate: -1 }),
    ]);

    // Save to history only if the user is authenticated and a query was provided.
    if (searchTerm && req.user) {
      try {
        await SearchHistory.create({
          user: req.user._id,
          query: searchTerm,
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
