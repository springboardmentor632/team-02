const express = require('express');
const Policy = require('../models/policy');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.ministry) filters.ministry = req.query.ministry;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.q) {
      filters.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { summary: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const policies = await Policy.find(filters).sort({ publishedAt: -1 });
    res.json({ policies });
  } catch (err) {
    next(err);
  }
});

// ── Saved policies (must be BEFORE /:id so Express doesn't match 'saved' as an ObjectId) ──────────────
const SavedPolicy = require('../models/savedPolicy');

router.get('/saved', authenticate, async (req, res, next) => {
  try {
    const saved = await SavedPolicy.find({ user: req.user._id }).populate('policy');
    res.json({ saved: saved.map(s => s.policy).filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/is-saved', authenticate, async (req, res, next) => {
  try {
    const exists = await SavedPolicy.findOne({ user: req.user._id, policy: req.params.id });
    res.json({ saved: !!exists });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/save', authenticate, async (req, res, next) => {
  try {
    const exists = await SavedPolicy.findOne({ user: req.user._id, policy: req.params.id });
    if (!exists) {
      await SavedPolicy.create({ user: req.user._id, policy: req.params.id });
    }
    res.json({ message: 'Policy saved' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/save', authenticate, async (req, res, next) => {
  try {
    await SavedPolicy.deleteOne({ user: req.user._id, policy: req.params.id });
    res.json({ message: 'Policy unsaved' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
});

const { dispatchNotification } = require('../utils/notificationDispatcher');

router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const policy = await Policy.create({
      ...req.body,
      author: req.user._id,
      status: req.body.status || 'Draft',
    });
    await logAction(req.user._id, 'CREATE_POLICY', 'Policy', policy._id, `Created policy: "${policy.title}"`, req.ip);

    // Trigger New Policy Alert notification
    await dispatchNotification({
      title: `📢 New Policy Alert: ${policy.title}`,
      message: `A new policy under ${policy.ministry || 'Government of India'} has been published.`,
      category: 'policy_alert',
      type: 'info',
      targetRoles: ['Citizen', 'Researcher', 'Organization'],
      link: `/citizen/policy/${policy._id}`,
      channels: ['in_app', 'email', 'sms'],
    });

    res.status(201).json({ policy });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/approve', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', approvedBy: req.user._id, publishedAt: new Date() },
      { new: true }
    );
    if (policy) {
      await logAction(req.user._id, 'APPROVE_POLICY', 'Policy', policy._id, `Approved policy: "${policy.title}"`, req.ip);
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/reject', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { status: 'Archived' },
      { new: true }
    );
    if (policy) {
      await logAction(req.user._id, 'REJECT_POLICY', 'Policy', policy._id, `Rejected policy: "${policy.title}"`, req.ip);
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (policy) {
      await logAction(req.user._id, 'UPDATE_POLICY', 'Policy', policy._id, `Updated policy: "${policy.title}"`, req.ip);
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'DELETE_POLICY', 'Policy', req.params.id, `Deleted policy ID ${req.params.id}`, req.ip);
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
