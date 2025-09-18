import express from 'express';
import { createWallet, getWallet, withdrawMoney, transferMoney } from '../controllers/walletcontroller.js';
import verifyToken from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/createwallet', verifyToken, createWallet);
router.get('/getWallet', verifyToken, getWallet);
router.post('/withdrawmoney', verifyToken, withdrawMoney);
router.post('/transfermoney', verifyToken, transferMoney);

export default router;
