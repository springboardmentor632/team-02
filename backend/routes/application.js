const express = require('express');
const Application = require('../models/application');
const Scheme = require('../models/scheme');
const Policy = require('../models/policy');
const EligibilityRule = require('../models/eligibilityRule');
const Notification = require('../models/notification');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const CITIZEN_ROLES = ['Citizen', 'Researcher', 'Organization'];

function isEligible(rule, profile) {
  if (!rule) return false;
  const {
    age, gender, income, occupation, education, location, socialCategory, disabilityStatus,
  } = profile;

  const matchesAge = !rule.ageRange
    || ((!rule.ageRange.min || age >= rule.ageRange.min) && (!rule.ageRange.max || age <= rule.ageRange.max));
  const matchesGender = rule.gender === 'Any' || rule.gender === gender;
  const matchesIncome = !rule.incomeLimit || income <= parseInt(rule.incomeLimit, 10) || rule.incomeLimit === 'Any';
  const matchesOccupation = !rule.occupation || occupation === rule.occupation;
  const matchesEducation = !rule.education || education === rule.education;
  const matchesLocation = !rule.location || location === rule.location;
  const matchesSocial = !rule.socialCategory || socialCategory === rule.socialCategory;
  const matchesDisability = rule.disabilityStatus === 'Any' || rule.disabilityStatus === disabilityStatus;

  return matchesAge && matchesGender && matchesIncome && matchesOccupation
    && matchesEducation && matchesLocation && matchesSocial && matchesDisability;
}

function getItemName(application) {
  if (application.applicationType === 'policy' && application.policy) {
    return application.policy.title || 'Policy';
  }
  if (application.scheme) {
    return application.scheme.name || 'Scheme';
  }
  return 'Application';
}

router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('scheme', 'name category ministry status applicationMode')
      .populate('policy', 'title category ministry status')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('scheme', 'name category ministry status')
      .populate('policy', 'title category ministry department status')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scheme')
      .populate('policy')
      .populate('user', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isOwner = application.user._id.toString() === req.user._id.toString();
    const isGov = ['Administrator', 'Government Official'].includes(req.user.role);
    if (!isOwner && !isGov) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!CITIZEN_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only citizens can submit applications' });
    }

    const {
      applicationType = 'scheme',
      schemeId,
      policyId,
      eligibilitySnapshot,
      formData,
    } = req.body;

    if (!formData) {
      return res.status(400).json({ message: 'Form data is required' });
    }

    if (applicationType === 'policy') {
      if (!policyId) {
        return res.status(400).json({ message: 'Policy ID is required' });
      }

      const policy = await Policy.findById(policyId);
      if (!policy || policy.status !== 'Active') {
        return res.status(404).json({ message: 'Policy not found or not active' });
      }

      const existing = await Application.findOne({
        user: req.user._id,
        policy: policyId,
        applicationType: 'policy',
        status: { $in: ['Submitted', 'Under Review', 'Approved'] },
      });
      if (existing) {
        return res.status(409).json({ message: 'You already have an active application for this policy' });
      }

      const application = await Application.create({
        user: req.user._id,
        applicationType: 'policy',
        policy: policyId,
        applicantName: `${req.user.firstName} ${req.user.lastName}`.trim(),
        applicantEmail: req.user.email,
        applicantPhone: req.user.phone || '',
        eligibilitySnapshot: eligibilitySnapshot || {},
        formData,
      });

      await Notification.create({
        title: 'Application Submitted',
        message: `Your application for policy "${policy.title}" has been submitted successfully.`,
        type: 'success',
        category: 'application_update',
        targetRoles: [req.user.role],
        user: req.user._id,
        link: '/citizen/applications',
      });

      const populated = await Application.findById(application._id)
        .populate('policy', 'title category ministry status');

      return res.status(201).json({ application: populated });
    }

    if (!schemeId || !eligibilitySnapshot) {
      return res.status(400).json({ message: 'Scheme and eligibility profile are required' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme || scheme.status !== 'Active') {
      return res.status(404).json({ message: 'Scheme not found or not active' });
    }

    const rule = await EligibilityRule.findOne({ scheme: schemeId });
    if (!isEligible(rule, eligibilitySnapshot)) {
      return res.status(400).json({ message: 'You are not eligible for this scheme based on your profile' });
    }

    const existing = await Application.findOne({
      user: req.user._id,
      scheme: schemeId,
      applicationType: 'scheme',
      status: { $in: ['Submitted', 'Under Review', 'Approved'] },
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have an active application for this scheme' });
    }

    const application = await Application.create({
      user: req.user._id,
      applicationType: 'scheme',
      scheme: schemeId,
      applicantName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      applicantEmail: req.user.email,
      applicantPhone: req.user.phone || formData.phone || '',
      eligibilitySnapshot,
      formData,
    });

    await Notification.create({
      title: 'Application Submitted',
      message: `Your application for "${scheme.name}" has been submitted successfully.`,
      type: 'success',
      category: 'application_update',
      targetRoles: [req.user.role],
      user: req.user._id,
      link: '/citizen/applications',
    });

    const populated = await Application.findById(application._id)
      .populate('scheme', 'name category ministry status applicationMode');

    res.status(201).json({ application: populated });
  } catch (err) {
    next(err);
  }
});

const { dispatchNotification } = require('../utils/notificationDispatcher');

router.put('/:id/status', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const { status, govNotes } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('scheme', 'name')
      .populate('policy', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status || application.status;
    application.govNotes = govNotes ?? application.govNotes;
    application.reviewedBy = req.user._id;
    await application.save();

    const itemName = getItemName(application);
    const typeMap = {
      Approved: 'success',
      Completed: 'success',
      Rejected: 'danger',
      'Under Review': 'info',
      'Documents Requested': 'warning',
    };

    await dispatchNotification({
      title: `📝 Application ${application.status}`,
      message: `Your application for "${itemName}" is now ${application.status}.${govNotes ? ` Note: ${govNotes}` : ''}`,
      type: typeMap[application.status] || 'info',
      category: 'application_update',
      user: application.user,
      link: '/citizen/applications',
      channels: ['in_app', 'email', 'sms'],
    });

    res.json({ application });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
