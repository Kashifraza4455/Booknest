//wallet routes
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletcontroller');
const verifyToken = require('../middleware/authmiddleware');

router.post('/createwallet', verifyToken, walletController.createWallet); // create wallet for user
router.get('/getWallet', verifyToken, walletController.getWallet); // deposit money to wallet
router.post('/withdrawmoney', verifyToken, walletController.withdrawMoney); // withdraw money from wallet

module.exports = router;