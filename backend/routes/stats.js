const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const User = require('../models/user');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [policyCount, schemeCount, userCount, pendingCount, totalPolicyCount] = await Promise.all([
      Policy.countDocuments({ status: 'Active' }),
      Scheme.countDocuments({ status: 'Active' }),
      User.countDocuments(),
      Policy.countDocuments({ status: { $in: ['Pending', 'Draft'] } }),
      Policy.countDocuments(),
    ]);

    const states = await Policy.distinct('state');
    const schemeStates = await Scheme.distinct('state');
    const allStates = [...new Set([...states, ...schemeStates].filter(Boolean))];

    const trendingPolicies = await Policy.find({ status: 'Active' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title');
    const trendingSchemes = await Scheme.find({ status: 'Active' })
      .sort({ launchDate: -1 })
      .limit(5)
      .select('name');

    const trending = [
      ...trendingPolicies.map((p) => p.title),
      ...trendingSchemes.map((s) => s.name),
    ].slice(0, 6);

    // Disable caching so Angular always gets fresh counts (prevents 304 empty body issues)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.json({
      stats: {
        policies: policyCount,        // active policies
        schemes: schemeCount,          // active schemes
        states: allStates.length || 36,
        users: userCount,
        pendingPolicies: pendingCount, // pending + draft
        totalPolicies: totalPolicyCount,
      },
      trending,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
