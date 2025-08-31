//otp model that will be deleted after 10 minutes
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
//delete otp after 10 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
const otpmodel = mongoose.model('otpmodel', otpSchema);
module.exports = otpmodel;