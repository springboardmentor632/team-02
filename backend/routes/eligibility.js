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
    const matching = await Promise.all(allSchemes.map(async (scheme) => {
      const rule = await EligibilityRule.findOne({ scheme: scheme._id });
      if (!rule) return null;
      const matchesAge = !rule.ageRange || (!rule.ageRange.min || age >= rule.ageRange.min) && (!rule.ageRange.max || age <= rule.ageRange.max);
      const matchesGender = rule.gender === 'Any' || rule.gender === gender;
      const matchesIncome = !rule.incomeLimit || income <= parseInt(rule.incomeLimit, 10) || rule.incomeLimit === 'Any';
      const matchesOccupation = !rule.occupation || occupation === rule.occupation;
      const matchesEducation = !rule.education || education === rule.education;
      const matchesLocation = !rule.location || location === rule.location;
      const matchesSocial = !rule.socialCategory || socialCategory === rule.socialCategory;
      const matchesDisability = rule.disabilityStatus === 'Any' || rule.disabilityStatus === disabilityStatus;

      return matchesAge && matchesGender && matchesIncome && matchesOccupation && matchesEducation && matchesLocation && matchesSocial && matchesDisability
        ? { scheme, rule }
        : null;
    }));
    res.json({ matches: matching.filter(Boolean) });
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
