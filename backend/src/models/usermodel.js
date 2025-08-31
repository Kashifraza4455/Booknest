const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true, default: 'First Name' },
    lastname: { type: String, required: true, default: 'Last Name' },
    phoneno: { type: String, required: true, default: '1234567890' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: {
        city: { type: String },
        country: { type: String }
    },
    isadmin: { type: Boolean, default: false },
    profileimage: { type: String },
    isverified: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] ,default: 'Pending' },
    isBlocked: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    sentrequests: [
        {
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
            status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
        }
    ],
    
    receivedrequests: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
            status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
        }
    ],        
    createdAt: { type: Date, default: Date.now },
    stripeAccountId: { type: String }, // Store Stripe Connected Account ID
    tosAcceptance: { date: Date, ip: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
