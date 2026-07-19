const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  content: { type: String, trim: true },
  category: {
    type: String,
    enum: ['Education', 'Healthcare', 'Agriculture', 'Employment', 'Finance', 'Women & Child Welfare', 'Housing', 'Environment', 'Digital Governance', 'Infrastructure'],
    required: true,
  },
  ministry: { type: String, trim: true },
  department: { type: String, trim: true },
  state: { type: String, trim: true },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Draft', 'Pending', 'Active', 'Archived'], default: 'Draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  attachments: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
