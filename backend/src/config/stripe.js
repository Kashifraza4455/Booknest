const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);  // Your secret key from Stripe Dashboard
module.exports = stripe;
