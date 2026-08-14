const express = require('express');
const Notification = require('../models/notification');
const User = require('../models/user');
const { authenticate, authorize } = require('../middleware/auth');
const { dispatchNotification } = require('../utils/notificationDispatcher');

const router = express.Router();

// Get all notifications for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, type } = req.query;
    const filter = {
      $or: [
        { user: req.user._id },
        {
          category: { $nin: ['application', 'application_update'] },
          $or: [
            { targetRoles: req.user.role },
            { targetRoles: [] },
            { targetRoles: { $exists: false } },
          ],
        },
      ],
    };


    if (category && category !== 'all') {
      filter.category = category;
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter).sort({ sentAt: -1 });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { user: req.user._id },
          { targetRoles: req.user.role },
          { targetRoles: [] },
          { targetRoles: { $exists: false } },
        ],
        read: false,
      },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// Mark single as read
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

// Get user notification preferences
router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences email phone');
    const prefs = user?.notificationPreferences || {
      emailAlerts: true,
      smsAlerts: true,
      inAppAlerts: true,
      deadlineReminders: true,
    };
    res.json({ preferences: prefs, email: user?.email, phone: user?.phone });
  } catch (err) {
    next(err);
  }
});

// Update user notification preferences
router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { new: true }
    ).select('notificationPreferences');
    res.json({ preferences: user.notificationPreferences });
  } catch (err) {
    next(err);
  }
});

// Send test dispatch (Email, SMS, In-App)
router.post('/test-dispatch', authenticate, async (req, res, next) => {
  try {
    const { title, message, category, type } = req.body;
    const notification = await dispatchNotification({
      title: title || 'Test Alert: National Education Policy Update',
      message: message || 'This is a test notification dispatched via In-App, Email, and SMS gateways.',
      category: category || 'policy_alert',
      type: type || 'info',
      user: req.user._id,
      channels: ['in_app', 'email', 'sms'],
      link: '/citizen/search',
    });
    res.status(201).json({ notification, message: 'Test notification dispatched successfully via Email, SMS & In-App' });
  } catch (err) {
    next(err);
  }
});

// Create manual notification (Admins & Govt Officials)
router.post('/', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    const notification = await dispatchNotification({
      ...req.body,
      user: req.body.user || null,
      channels: req.body.channels || ['in_app', 'email', 'sms'],
    });
    res.status(201).json({ notification });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
