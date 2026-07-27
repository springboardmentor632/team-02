const AuditLog = require('../models/auditLog');

const logAction = async (userId, action, entity, entityId, details, ipAddress = '') => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entity,
      entityId,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

module.exports = { logAction };
