const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Submitted',
  },
  applicantName: { type: String, trim: true },
  applicantEmail: { type: String, trim: true },
  applicantPhone: { type: String, trim: true },
  eligibilitySnapshot: {
    age: Number,
    gender: String,
    income: Number,
    occupation: String,
    education: String,
    location: String,
    socialCategory: String,
    disabilityStatus: String,
    state: String,
    district: String,
    areaType: String,
  },
  formData: {
    address: String,
    aadhaarNumber: String,
    bankAccount: String,
    additionalNotes: String,
    documentsAcknowledged: Boolean,
  },
  govNotes: { type: String, trim: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

applicationSchema.index({ user: 1, scheme: 1 });

module.exports = mongoose.model('Application', applicationSchema);
