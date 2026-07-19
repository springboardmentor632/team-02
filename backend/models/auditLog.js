const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, trim: true },
  entity: { type: String, trim: true },
  entityId: { type: String, trim: true },
  details: { type: String, trim: true },
  ipAddress: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
