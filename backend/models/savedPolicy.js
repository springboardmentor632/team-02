const mongoose = require('mongoose');

const savedPolicySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
}, { timestamps: true });

savedPolicySchema.index({ user: 1, policy: 1 }, { unique: true });

module.exports = mongoose.model('SavedPolicy', savedPolicySchema);
