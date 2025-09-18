// src/routes/userroute.js
import express from 'express';
import upload from '../middleware/multer.js';
import * as userController from '../controllers/usercontroller.js';
import verifyToken from '../middleware/authmiddleware.js';
import verifyJWT from '../middleware/verifyJWT.js';
import {
  addToWishlist,
  getWishlist,
  getNotifications,
  getNumberOfUsers,
  userEngagement,
  recentlyRegisteredUsers,
  getAllUsers,
  searchUsers,
  blockUser,
  approveUser,
  rejectUser,
  getRequests
} from "../controllers/usercontroller.js";

const router = express.Router();

router.post('/register', userController.createUser);                
router.post('/sendvarification', userController.sendVerification);
router.get('/verify/:token', userController.verifyEmail);
router.post('/login', userController.loginUser);
router.get('/getuser', verifyToken, userController.getUserInfo);
router.put('/update-profile', verifyToken, upload.single("profilePic"), userController.uploadProfile);
router.post('/change-password', verifyJWT, userController.changePassword);
router.post('/send-otp', userController.sendOTP);
router.post('/verifyotp', userController.verifyOTP);
router.post('/addtowishlist', verifyToken, userController.addToWishlist);
router.get('/getwishlist', verifyToken, userController.getWishlist);

// Admin routes
router.get('/admin/numberofusers', verifyToken, userController.getnumberofUsers);
router.get('/admin/userengagement', verifyToken, userController.userEngagement);
router.get('/admin/recentlyrigisteredusers', verifyToken, userController.recentlyRegisteredUsers);
router.get('/admin/getallusers', verifyToken, userController.getallusers);
router.post("/admin/searchusers", verifyToken, userController.searchUsers);
router.put("/admin/blockuser/:id", verifyToken, userController.blockUser);
router.put("/admin/approveuser/:id", verifyToken, userController.approveUser);
router.put("/admin/rejectuser/:id", verifyToken, userController.rejectUser);

export default router;
