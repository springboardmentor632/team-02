const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema({
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  ageRange: { min: Number, max: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Any'], default: 'Any' },
  incomeLimit: { type: String, trim: true },
  occupation: { type: String, trim: true },
  education: { type: String, trim: true },
  location: { type: String, trim: true },
  socialCategory: { type: String, trim: true },
  disabilityStatus: { type: String, enum: ['None', 'Partial', 'Full', 'Any'], default: 'Any' },
  additionalRules: [String],
}, { timestamps: true });

module.exports = mongoose.model('EligibilityRule', eligibilityRuleSchema);
