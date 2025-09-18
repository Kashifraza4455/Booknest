// src/models/otpmodel.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true }
}, { timestamps: true });

// Delete OTP after 10 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP; // ✅ ESM export
