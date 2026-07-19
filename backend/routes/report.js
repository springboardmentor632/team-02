const express = require('express');
const Policy = require('../models/policy');
const Scheme = require('../models/scheme');
const SearchHistory = require('../models/searchHistory');
const Report = require('../models/report');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const { type } = req.query;
    let data = {};

    if (type === 'policies') {
      data = {
        count: await Policy.countDocuments(),
        groupedByCategory: await Policy.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]),
      };
    } else if (type === 'schemes') {
      data = {
        count: await Scheme.countDocuments(),
        groupedByCategory: await Scheme.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]),
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
      data = { policies: await Policy.countDocuments(), schemes: await Scheme.countDocuments(), searches: await SearchHistory.countDocuments() };
    }

    const report = await Report.create({
      title: `Report ${new Date().toISOString()}`,
      description: `Automated report ${type || 'summary'}`,
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
