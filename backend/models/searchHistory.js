const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  query: { type: String, trim: true },
  filters: { type: Object, default: {} },
  resultsCount: { type: Number, default: 0 },
  searchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
