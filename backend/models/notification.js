const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
  category: { 
    type: String, 
    enum: ['policy_alert', 'scheme_update', 'deadline_reminder', 'application_update', 'system'], 
    default: 'system' 
  },
  channels: [{ type: String, enum: ['in_app', 'email', 'sms'] }],
  deliveryStatus: {
    email: { type: String, enum: ['Not Sent', 'Sending', 'Sent', 'Failed'], default: 'Not Sent' },
    sms: { type: String, enum: ['Not Sent', 'Sending', 'Sent', 'Failed'], default: 'Not Sent' },
    inApp: { type: String, enum: ['Delivered'], default: 'Delivered' },
  },
  targetRoles: [{ type: String, trim: true }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  link: { type: String, trim: true },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
