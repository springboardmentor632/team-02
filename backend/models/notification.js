const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
  category: { type: String, trim: true },
  targetRoles: [{ type: String, trim: true }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  link: { type: String, trim: true },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
