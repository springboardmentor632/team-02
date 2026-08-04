const express = require('express');
const Scheme = require('../models/scheme');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const { dispatchNotification } = require('../utils/notificationDispatcher');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.ministry) filters.ministry = req.query.ministry;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.q) {
      filters.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { summary: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const schemes = await Scheme.find(filters).sort({ launchDate: -1 });
    res.json({ schemes });
  } catch (err) {
    next(err);
  }
});

router.post('/compare', authenticate, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Scheme IDs array is required' });
    }
    const schemes = await Scheme.find({ _id: { $in: ids } });
    const EligibilityRule = require('../models/eligibilityRule');
    const rules = await EligibilityRule.find({ scheme: { $in: ids } });
    const ruleMap = {};
    rules.forEach((r) => { ruleMap[r.scheme.toString()] = r; });
    res.json({ schemes, rules: ruleMap });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const scheme = await Scheme.create({
      ...req.body,
      author: req.user._id,
      status: req.body.status || 'Draft',
    });
    await logAction(req.user._id, 'CREATE_SCHEME', 'Scheme', scheme._id, `Created scheme: "${scheme.name}"`, req.ip);

    await dispatchNotification({
      title: `🎖️ New Scheme Alert: ${scheme.name}`,
      message: `A new government scheme "${scheme.name}" is now active in ${scheme.state || 'All India'}.`,
      category: 'scheme_update',
      type: 'success',
      targetRoles: ['Citizen', 'Organization'],
      link: `/citizen/scheme/${scheme._id}`,
      channels: ['in_app', 'email', 'sms'],
    });

    res.status(201).json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (scheme) {
      await logAction(req.user._id, 'UPDATE_SCHEME', 'Scheme', scheme._id, `Updated scheme: "${scheme.name}"`, req.ip);

      await dispatchNotification({
        title: `🔄 Scheme Update: ${scheme.name}`,
        message: `The guidelines and details for scheme "${scheme.name}" have been updated.`,
        category: 'scheme_update',
        type: 'warning',
        targetRoles: ['Citizen', 'Organization'],
        link: `/citizen/scheme/${scheme._id}`,
        channels: ['in_app', 'email', 'sms'],
      });
    }
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/approve', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', approvedBy: req.user._id, launchDate: new Date() },
      { new: true }
    );
    if (scheme) {
      await logAction(req.user._id, 'APPROVE_SCHEME', 'Scheme', scheme._id, `Approved scheme: "${scheme.name}"`, req.ip);
    }
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/reject', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { status: 'Archived' },
      { new: true }
    );
    if (scheme) {
      await logAction(req.user._id, 'REJECT_SCHEME', 'Scheme', scheme._id, `Rejected scheme: "${scheme.name}"`, req.ip);
    }
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'DELETE_SCHEME', 'Scheme', req.params.id, `Deleted scheme ID ${req.params.id}`, req.ip);
    res.json({ message: 'Scheme deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
