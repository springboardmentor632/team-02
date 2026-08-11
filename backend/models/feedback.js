const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, trim: true },
  senderRole: { type: String, trim: true },
  message: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  ticketId: { type: String, trim: true, unique: true, sparse: true },
  moduleType: {
    type: String,
    enum: ['Citizen Feedback', 'Issue Reporting', 'Help Desk', 'FAQ Management', 'Query Resolution', 'Contact Support'],
    default: 'Citizen Feedback'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: { type: String, trim: true, default: 'Citizen' },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  subject: { type: String, trim: true },
  message: { type: String, trim: true },
  category: { type: String, trim: true, default: 'General Feedback' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  department: { type: String, trim: true, default: 'General Support' },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved', 'Closed'], default: 'New' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  response: { type: String, trim: true },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: { type: Date },
  resolutionTimeHours: { type: Number, default: 0 },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

