const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const User = require('../models/user');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [policyCount, schemeCount, userCount] = await Promise.all([
      Policy.countDocuments({ status: 'Active' }),
      Scheme.countDocuments({ status: 'Active' }),
      User.countDocuments(),
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

    res.json({
      stats: {
        policies: policyCount,
        schemes: schemeCount,
        states: allStates.length || 36,
        users: userCount,
      },
      trending,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
