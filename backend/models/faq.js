const mongoose = require('mongoose');

const faqMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, trim: true },
  senderRole: { type: String, trim: true },
  message: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, trim: true, default: 'Awaiting official response...' },
  category: { type: String, trim: true, default: 'General' },
  targetRole: { type: String, trim: true, default: 'All' },
  helpfulCount: { type: Number, default: 0 },
  unhelpfulCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  askedByName: { type: String, trim: true, default: 'Citizen' },
  askedByRole: { type: String, trim: true, default: 'Citizen' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [faqMessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
