// src/controllers/walletcontroller.js
import User from '../models/usermodel.js';
import Wallet from '../models/userwallet.js';
import dotenv from 'dotenv';
dotenv.config();


export default router;


// Create Wallet
export const createWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) return res.status(400).json({ message: "Wallet already exists" });

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      business_type: 'individual',
      email: user.email,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    });

    user.stripeAccountId = account.id;
    await user.save();

    const newWallet = await Wallet.create({
      userId,
      balance: 0,
      stripeAccountId: account.id,
      transactions: []
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/refresh',
      return_url: 'http://localhost:3000/success',
      type: 'account_onboarding',
    });

    res.status(201).json({ 
      message: "Wallet created successfully, verify Stripe account", 
      wallet: newWallet, 
      onboardingUrl: accountLink.url 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Wallet
export const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ userId }).populate('userId');
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const balance = await stripe.balance.retrieve({ stripeAccount: wallet.stripeAccountId });
    const dollarRate = 279.75;
    const availablebalance = `${(balance.available[0].amount/100)*dollarRate} PKR`;
    const pendingbalance = `${(balance.pending[0].amount/100)*dollarRate} PKR`;

    res.status(200).json({ available: availablebalance, underReview: pendingbalance, wallet });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw Money
export const withdrawMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    if (amount > wallet.balance) return res.status(400).json({ message: "Insufficient balance" });

    const balance = await stripe.balance.retrieve({ stripeAccount: wallet.stripeAccountId });
    if (balance.available[0].amount < amount * 100) {
      return res.status(400).json({ message: "Insufficient balance in Stripe account" });
    }

    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination: wallet.stripeAccountId,
    });

    wallet.transactions.push({ type: 'debit', amount, description: 'Withdrawal from wallet' });
    await wallet.save();

    res.status(200).json({ message: "Withdrawal successful", transfer });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer Money
export const transferMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, receiverId } = req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    if (amount > wallet.balance) return res.status(400).json({ message: "Insufficient balance" });

    const receiverWallet = await Wallet.findOne({ userId: receiverId });
    if (!receiverWallet) return res.status(404).json({ message: "Receiver wallet not found" });

    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination: receiverWallet.stripeAccountId,
    });

    wallet.balance -= amount;
    wallet.transactions.push({ type: 'debit', amount, description: 'Transfer to ' + receiverId });
    await wallet.save();

    receiverWallet.balance += amount;
    receiverWallet.transactions.push({ type: 'credit', amount, description: 'received from ' + userId });
    await receiverWallet.save();

    res.status(200).json({ message: "Transfer successful", transfer });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
