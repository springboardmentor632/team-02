const express = require('express');
const Notification = require('../models/notification');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ targetRoles: req.user.role }, { targetRoles: [] }, { targetRoles: { $exists: false } }],
    }).sort({ sentAt: -1 });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const notification = await Notification.create({ ...req.body, user: req.user._id });
    res.status(201).json({ notification });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
