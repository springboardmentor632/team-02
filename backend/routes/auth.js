const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, organization, phone } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'Citizen',
      organization,
      phone,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    return res.json({
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user: updatedUser });
  } catch (err) {
    next(err);
  }
});

// ── ADMIN USER MANAGEMENT ENDPOINTS ──────────────────────────────────────────
router.get('/users', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/role', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (user) {
      await logAction(req.user._id, 'CHANGE_ROLE', 'User', user._id, `Changed role of user ${user.email} to ${role}`, req.ip);
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/status', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (user) {
      await logAction(req.user._id, 'CHANGE_STATUS', 'User', user._id, `Changed status of user ${user.email} to ${status}`, req.ip);
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
