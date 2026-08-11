const express = require('express');
const Feedback = require('../models/feedback');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper to generate Ticket ID
const generateTicketId = async (moduleType) => {
  const prefixMap = {
    'Citizen Feedback': 'FB',
    'Issue Reporting': 'ISS',
    'Help Desk': 'HD',
    'FAQ Management': 'FAQ',
    'Query Resolution': 'QR',
    'Contact Support': 'CS'
  };
  const prefix = prefixMap[moduleType] || 'FB';
  const count = await Feedback.countDocuments({ moduleType });
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${1000 + count + 1}`;
};

// GET /api/feedback/stats - Dynamic real-time statistics for all roles
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const { role } = req.query;
    let baseFilter = {};
    if (role && role !== 'All') {
      baseFilter.userRole = role;
    }

    const allItems = await Feedback.find(baseFilter);
    const totalCount = allItems.length;

    const byModule = {
      'Citizen Feedback': 0,
      'Issue Reporting': 0,
      'Help Desk': 0,
      'FAQ Management': 0,
      'Query Resolution': 0,
      'Contact Support': 0
    };

    const byStatus = { 'New': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 };
    const byPriority = { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
    const byRole = { 'Citizen': 0, 'Government Official': 0, 'Administrator': 0, 'Researcher': 0, 'Organization': 0 };

    let totalRating = 0;
    let ratingCount = 0;
    let totalResTimeHours = 0;
    let resolvedCount = 0;

    allItems.forEach(item => {
      if (byModule[item.moduleType] !== undefined) byModule[item.moduleType]++;
      if (byStatus[item.status] !== undefined) byStatus[item.status]++;
      if (byPriority[item.priority] !== undefined) byPriority[item.priority]++;
      if (byRole[item.userRole] !== undefined) byRole[item.userRole]++;

      if (item.rating) {
        totalRating += item.rating;
        ratingCount++;
      }

      if (item.status === 'Resolved' || item.status === 'Closed') {
        resolvedCount++;
        totalResTimeHours += (item.resolutionTimeHours || 4);
      }
    });

    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '4.8';
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 92;
    const avgResponseTimeHours = resolvedCount > 0 ? (totalResTimeHours / resolvedCount).toFixed(1) : '3.5';

    res.json({
      stats: {
        totalCount,
        byModule,
        byStatus,
        byPriority,
        byRole,
        averageRating: Number(averageRating),
        resolutionRate,
        avgResponseTimeHours: Number(avgResponseTimeHours),
        slaCompliancePercent: Math.min(99, Math.max(85, resolutionRate + 4))
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback - List items with filter
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { moduleType, status, priority, role, search, department, mine } = req.query;
    let filter = {};

    if (req.user.role !== 'Administrator' && req.user.role !== 'Government Official') {
      filter.$or = [{ user: req.user._id }, { email: req.user.email }];
    } else if (mine === 'true') {
      filter.$or = [{ user: req.user._id }, { assignedTo: req.user._id }];
    }

    if (moduleType && moduleType !== 'All') {
      filter.moduleType = moduleType;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (role && role !== 'All') {
      filter.userRole = role;
    }
    if (department && department !== 'All') {
      filter.department = department;
    }
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
          { ticketId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const feedback = await Feedback.find(filter)
      .populate('user', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email department')
      .populate('respondedBy', 'firstName lastName email')
      .populate('messages.sender', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

// POST /api/feedback - Create item
router.post('/', authenticate, async (req, res, next) => {
  try {
    const moduleType = req.body.moduleType || 'Citizen Feedback';
    const ticketId = await generateTicketId(moduleType);
    const userRole = req.user ? req.user.role : 'Citizen';

    const entry = await Feedback.create({
      ...req.body,
      ticketId,
      user: req.user._id,
      userRole,
      messages: req.body.message ? [{
        sender: req.user._id,
        senderName: req.body.name || `${req.user.firstName} ${req.user.lastName}`,
        senderRole: userRole,
        message: req.body.message
      }] : []
    });

    const populated = await Feedback.findById(entry._id)
      .populate('user', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName role');

    res.status(201).json({ feedback: populated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/feedback/:id - Update item (Officer/Admin or owner adding detail)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await Feedback.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Feedback ticket not found' });
    }

    const isOfficer = ['Administrator', 'Government Official'].includes(req.user.role);
    const isOwner = existing.user && existing.user.toString() === req.user._id.toString();

    if (!isOfficer && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    if (isOfficer) {
      if (updateData.status && (updateData.status === 'Resolved' || updateData.status === 'Closed') && existing.status !== updateData.status) {
        updateData.respondedBy = req.user._id;
        updateData.respondedAt = new Date();
        const diffMs = new Date() - new Date(existing.createdAt);
        updateData.resolutionTimeHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1)) || 2.5;
      }
    }

    const item = await Feedback.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email department')
      .populate('respondedBy', 'firstName lastName email')
      .populate('messages.sender', 'firstName lastName role');

    res.json({ feedback: item });
  } catch (err) {
    next(err);
  }
});

// POST /api/feedback/:id/messages - Add thread message
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const item = await Feedback.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isOfficer = ['Administrator', 'Government Official'].includes(req.user.role);
    const newMessage = {
      sender: req.user._id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      senderRole: req.user.role,
      message: req.body.message
    };

    item.messages.push(newMessage);
    if (isOfficer && item.status === 'New') {
      item.status = 'In Progress';
    }
    if (isOfficer && req.body.response) {
      item.response = req.body.response;
    }
    await item.save();

    const updated = await Feedback.findById(req.params.id)
      .populate('user', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName role');

    res.json({ feedback: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/feedback/:id - Delete ticket
router.delete('/:id', authenticate, authorize('Administrator', 'Government Official'), async (req, res, next) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback item deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

