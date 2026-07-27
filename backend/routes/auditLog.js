const express = require('express');
const AuditLog = require('../models/auditLog');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all audit logs (Admin only)
router.get('/', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
