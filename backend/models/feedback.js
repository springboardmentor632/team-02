const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  subject: { type: String, trim: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' },
  response: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
