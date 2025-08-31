const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/usermodel');
const book = require('../models/bookmodel');
const userwallet = require('../models/userwallet');
const transporter = require('../middleware/transporter');
const dotenv = require('dotenv')
dotenv.config();

exports.createPaymentLink = async (req, res) => {
    try {
        const { stripePriceId, sellerStripeAccountId } = req.body;
        const buyerId = req.user.id;

        const buyer = await User.findById(buyerId);
        if (!buyer) {
            return res.status(404).json({ error: 'Buyer not found' });
        }

        const seller = await User.findOne({ stripeAccountId: sellerStripeAccountId });
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const product = await book.findOne({ stripePriceId });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.isSold) {
            return res.status(400).json({ error: 'Product already sold' });
        }

        // Retrieve the price from Stripe (to calculate 3% fee)
        const priceObj = await stripe.prices.retrieve(stripePriceId, {
            stripeAccount: sellerStripeAccountId
        });

        const amount = priceObj.unit_amount; // Amount in cents
        const platformFee = Math.round(amount * 0.03); // 3% fee for platform

        // Create a checkout session under the seller's connected Stripe account
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1
                }
            ],
            mode: 'payment',
            metadata: {
                sellerAccountId: sellerStripeAccountId
            },
            success_url: `http://localhost:3000/stripe/paymentsuccess/${stripePriceId}/${buyerId}`,
            cancel_url: `http://localhost:3000/payment-failed`,
            payment_intent_data: {
                application_fee_amount: platformFee // Deduct 3% fee
            }
        }, {
            stripeAccount: sellerStripeAccountId // Payment happens under the seller's account
        });

        res.status(201).json({ 
            message: 'Checkout session created successfully', 
            paymentUrl: session.url, 
            priceId: stripePriceId, 
            buyer: buyerId, 
            selleraccount: sellerStripeAccountId 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// , buyerId 
//handle payment success:
exports.PaymentSuccess = async (req, res) => {
    try {
        const { stripePriceId, buyerId, sellerStripeAccountId} = req.params;
        const { shippingAddress } = req.body;
        // Find the product in the database
        const
        product = await book.findOne({stripePriceId});
        wallet = await userwallet.findOne({sellerStripeAccountId}).populate('userId');
        seller = await User.findOne({sellerStripeAccountId});

        // return res.status(404).json({ error: seller });
        buyer = await User.findById(buyerId);

        // await wallet.save();

        product.isSold = true;
        if(shippingAddress){
            product.shippingAddress = shippingAddress;
        }
        if(buyerId){
            product.buyerId = buyerId;
        }
        await product.save();

        //send mail tp seller
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: seller.email,
            subject: "Book Sold",
            text: `Your book ${product.title} has been sold to ${buyer.firstname} ${buyer.lastname} on ${shippingAddress} successfully`
        });
        //send mail to buyer
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: buyer.email,
            subject: "Book Purchased",
            text: `You have purchased ${product.title} book on Address: ${shippingAddress} successfully`
        });

        res.status(200).json({ message: 'Payment successful' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

