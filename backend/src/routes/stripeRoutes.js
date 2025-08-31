const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const verifyToken = require('../middleware/authmiddleware');

// router.post('/createaccount', verifyToken ,stripeController.createSellerAccount);
router.post('/createpaymentlink', verifyToken ,stripeController.createPaymentLink);

//handle payment success:
router.get('/paymentsuccess/:stripePriceId/:buyerId' ,stripeController.PaymentSuccess);


module.exports = router;
