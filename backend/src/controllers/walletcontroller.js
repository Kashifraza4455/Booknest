const User = require('../models/usermodel');
const Wallet = require('../models/userwallet');
const dotenv = require('dotenv')
dotenv.config();


exports.createWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingWallet = await Wallet.findOne({ userId: userId });
        if (existingWallet) {
            return res.status(400).json({ message: "Wallet already exists" });
        }

        // Create Stripe Connect account
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            business_type: 'individual',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // Save Stripe account ID to user
        user.stripeAccountId = account.id;
        await user.save();

        // Create wallet in MongoDB
        const newWallet = await Wallet.create({
            userId: userId,
            balance: 0,
            stripeAccountId: account.id,
            transactions: []
        });

        // Generate Stripe onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'http://localhost:3000/refresh',
            return_url: 'http://localhost:3000/success',
            type: 'account_onboarding',
        });

        // Send response only ONCE
        res.status(201).json({ 
            message: "Wallet created successfully, verify Stripe account", 
            wallet: newWallet, 
            onboardingUrl: accountLink.url 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//get wallet
exports.getWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await Wallet.findOne({ userId: userId }).populate('userId');
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        const balance = await stripe.balance.retrieve({
            stripeAccount: wallet.stripeAccountId,
        });
        console.log(balance);    
        //current dollar rate into pkr
        const dollarRate = 279.75; // 1 dollar = 230 pkr
        const availablebalance = `${(balance.available[0].amount/100)*dollarRate} PKR`;
        const pendingbalance = `${(balance.pending[0].amount/100)*dollarRate} PKR`;

            return res.status(200).json({ available: availablebalance, underReview: pendingbalance, wallet: wallet });
              


        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// withdraw money from wallet stripe api
exports.withdrawMoney = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        const wallet = await Wallet.findOne({ userId: userId });
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        if (amount > wallet.balance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }


        const balance = await stripe.balance.retrieve({
            stripeAccount: wallet.stripeAccountId,
        });
        console.log(balance);    

        if (balance.available[0].amount < amount * 100 ) {
            return res.status(400).json({ message: "Insufficient balance in Stripe account" });
        }       

        // Transfer money from Stripe account to bank account
        const transfer = await stripe.transfers.create({
            amount: amount * 100, // amount in cents
            currency: 'usd',
            destination: wallet.stripeAccountId,
        });

        // Update wallet balance
        // wallet.balance -= amount;
        wallet.transactions.push({
            type: 'debit',
            amount: amount,
            description: 'Withdrawal from wallet'
        });
        await wallet.save();

        res.status(200).json({ message: "Withdrawal successful", transfer: transfer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//transfer money to another user
exports.transferMoney = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, receiverId } = req.body;
        const wallet = await Wallet.findOne({ userId: userId });
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        if (amount > wallet.balance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const receiverWallet = await Wallet.findOne({ userId: receiverId });
        if (!receiverWallet) {
            return res.status(404).json({ message: "Receiver wallet not found" });
        }

        // Transfer money from wallet to receiver wallet
        const transfer = await stripe.transfers.create({
            amount: amount * 100, // amount in cents
            currency: 'usd',
            destination: receiverWallet.stripeAccountId,
        });

        // Update wallet balance
        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'debit',
            amount: amount,
            description: 'Transfer to ' + receiverId
        });
        await wallet.save();

        receiverWallet.balance += amount;
        receiverWallet.transactions.push({
            type: 'credit',
            amount: amount,
            description: 'received from ' + userId
        });
        await receiverWallet.save();

        res.status(200).json({ message: "Transfer successful", transfer: transfer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};