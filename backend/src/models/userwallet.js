const mongoose = require("mongoose");

const userWalletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // balance: { type: Number, default: 0 },
    stripeAccountId: { type: String },
    transactions: [
        {
            type: { type: String, enum: ['credit', 'debit'] }, // Credit or Debit
            amount: { type: Number, required: true },
            description: { type: String },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserWallet', userWalletSchema);