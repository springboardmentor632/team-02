const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  details: { type: String, trim: true },
  category: {
    type: String,
    enum: ['Scholarships', 'Farmer Welfare', 'Healthcare', 'Housing', 'Business Support', 'Women Empowerment', 'Senior Citizen Welfare', 'Student Schemes', 'Employment Programs', 'Social Security'],
    required: true,
  },
  ministry: { type: String, trim: true },
  department: { type: String, trim: true },
  state: { type: String, trim: true },
  eligibilityCriteria: [String],
  benefits: [String],
  applicationMode: { type: String, trim: true },
  launchDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Pending', 'Active', 'Archived'], default: 'Draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  attachments: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
