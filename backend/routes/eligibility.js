const express = require('express');
const EligibilityRule = require('../models/eligibilityRule');
const Scheme = require('../models/scheme');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const rules = await EligibilityRule.find().populate('scheme');
    res.json({ rules });
  } catch (err) {
    next(err);
  }
});

router.post('/check', authenticate, async (req, res, next) => {
  try {
    const { age, gender, income, occupation, education, location, socialCategory, disabilityStatus } = req.body;
    const allSchemes = await Scheme.find({ status: 'Active' });

    const results = await Promise.all(allSchemes.map(async (scheme) => {
      const rule = await EligibilityRule.findOne({ scheme: scheme._id });

      // If no eligibility rule is defined, it is considered an Open Scheme (for all citizens)
      if (!rule) {
        return {
          scheme,
          rule: null,
          matchPercentage: 100,
          isOpenScheme: true,
        };
      }

      let totalCriteria = 0;
      let matchedCriteria = 0;

      // 1. Age Range
      if (rule.ageRange && (rule.ageRange.min != null || rule.ageRange.max != null)) {
        totalCriteria++;
        const minOk = rule.ageRange.min == null || age >= rule.ageRange.min;
        const maxOk = rule.ageRange.max == null || age <= rule.ageRange.max;
        if (minOk && maxOk) matchedCriteria++;
      }

      // 2. Gender
      if (rule.gender && rule.gender !== 'Any') {
        totalCriteria++;
        if (rule.gender === gender) matchedCriteria++;
      }

      // 3. Income Limit
      if (rule.incomeLimit && rule.incomeLimit !== 'Any' && String(rule.incomeLimit).trim() !== '') {
        totalCriteria++;
        const limit = parseInt(rule.incomeLimit, 10);
        if (!isNaN(limit)) {
          if (income <= limit) matchedCriteria++;
        } else {
          matchedCriteria++;
        }
      }

      // 4. Occupation
      if (rule.occupation && rule.occupation !== 'Any' && String(rule.occupation).trim() !== '') {
        totalCriteria++;
        if (rule.occupation === occupation) matchedCriteria++;
      }

      // 5. Education
      if (rule.education && rule.education !== 'Any' && String(rule.education).trim() !== '') {
        totalCriteria++;
        if (rule.education === education) matchedCriteria++;
      }

      // 6. Location
      if (rule.location && rule.location !== 'Any' && String(rule.location).trim() !== '') {
        totalCriteria++;
        if (
          rule.location === location ||
          (rule.location === 'Rural' && location === 'Rural') ||
          (rule.location === 'Urban' && location === 'Urban')
        ) {
          matchedCriteria++;
        }
      }

      // 7. Social Category
      if (rule.socialCategory && rule.socialCategory !== 'Any' && String(rule.socialCategory).trim() !== '') {
        totalCriteria++;
        if (rule.socialCategory === socialCategory) matchedCriteria++;
      }

      // 8. Disability Status
      if (rule.disabilityStatus && rule.disabilityStatus !== 'Any' && String(rule.disabilityStatus).trim() !== '') {
        totalCriteria++;
        if (rule.disabilityStatus === disabilityStatus) matchedCriteria++;
      }

      // If rule exists but has no restricting criteria specified, treat as Open Scheme
      if (totalCriteria === 0) {
        return {
          scheme,
          rule,
          matchPercentage: 100,
          isOpenScheme: true,
        };
      }

      const matchPercentage = Math.round((matchedCriteria / totalCriteria) * 100);

      return {
        scheme,
        rule,
        matchPercentage,
        isOpenScheme: false,
      };
    }));

    // Return all schemes with matchPercentage > 0, sorted descending by matchPercentage
    const filteredMatches = results
      .filter((m) => m.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ matches: filteredMatches });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const rule = await EligibilityRule.create(req.body);
    res.status(201).json({ rule });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
