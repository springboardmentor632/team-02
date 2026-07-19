const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, trim: true },
  query: { type: Object, default: {} },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now },
  data: { type: Object, default: {} },
  exportUrl: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
