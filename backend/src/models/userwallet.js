// src/models/userwallet.js
import mongoose from 'mongoose';

const userWalletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stripeAccountId: { type: String },
    transactions: [
        {
            type: { type: String, enum: ['credit', 'debit'] },
            amount: { type: Number, required: true },
            description: { type: String },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

const Wallet = mongoose.model('UserWallet', userWalletSchema);
export default Wallet;   // <-- ESM export
