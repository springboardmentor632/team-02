const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const SearchHistory = require('../models/searchHistory');
const Report = require('../models/report');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { type } = req.query;
    let data = {};

    if (type === 'policies') {
      data = {
        count: await Policy.countDocuments(),
        groupedByCategory: await Policy.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]),
        recentPolicies: await Policy.find().sort({ publishedAt: -1 }).limit(10).select('title category ministry status state publishedAt'),
      };
    } else if (type === 'schemes') {
      data = {
        count: await Scheme.countDocuments(),
        groupedByCategory: await Scheme.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]),
        recentSchemes: await Scheme.find().sort({ createdAt: -1 }).limit(10).select('name category ministry status state launchDate'),
      };
    } else if (type === 'searches') {
      data = {
        count: await SearchHistory.countDocuments(),
        topQueries: await SearchHistory.aggregate([
          { $group: { _id: '$query', total: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
        ]),
      };
    } else {
      data = {
        policies: await Policy.countDocuments({ status: 'Active' }),
        schemes: await Scheme.countDocuments({ status: 'Active' }),
        searches: await SearchHistory.countDocuments(),
        userRole: req.user.role,
      };
    }

    const report = await Report.create({
      title: `${type ? type.toUpperCase() : 'SUMMARY'} Report — ${new Date().toLocaleDateString()}`,
      description: `Automated ${type || 'platform summary'} report for ${req.user.role}`,
      type: type || 'summary',
      generatedBy: req.user._id,
      data,
    });

    res.json({ report });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
