const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Administrator', 'Government Official', 'Citizen', 'Researcher', 'Organization', 'Guest User'],
    default: 'Citizen',
  },
  organization: { type: String, trim: true },
  phone: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  profilePicture: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
