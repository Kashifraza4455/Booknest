//user route
const express = require('express'); 
const router = express.Router();
const upload = require('../middleware/multer');
const userController = require('../controllers/usercontroller');
const verifyToken = require('../middleware/authmiddleware');
const verifyJWT = require('../middleware/verifyJWT');
router.post('/register', userController.createUser);                //register user
router.post('/sendvarification', userController.sendVerification); //send verification email
router.get('/verify/:token', userController.verifyEmail);           //verify email
router.post('/login', userController.loginUser);                    //login user
router.get('/getuser',verifyToken, userController.getUserInfo);     //get user info
router.put('/update-profile',verifyToken, upload.single("profilePic"), userController.uploadProfile);   //update user info
router.post('/change-password', verifyJWT, userController.changePassword);
router.post('/send-otp', userController.sendOTP);                      //send otp
router.post('/verifyotp', userController.verifyOTP);                    //verify otp
// router.post('/resetpassword', userController.resetPassword);            //reset password
router.post('/addtowishlist',verifyToken, userController.addToWishlist);    //add to wishlist
router.get('/getwishlist',verifyToken, userController.getWishlist);     //get wishlist


// //admin routes
router.get('/admin/numberofusers', verifyToken, userController.getnumberofUsers); // get number of total registered users
router.get('/admin/userengagement', verifyToken, userController.userEngagement); // get user engagement
router.get('/admin/recentlyrigisteredusers', verifyToken, userController.recentlyRegisteredUsers); // get recently registered users
router.get('/admin/getallusers', verifyToken, userController.getallusers); // get all users by admin
router.post("/admin/searchusers", verifyToken, userController.searchUsers);
router.put("/admin/blockuser/:id", verifyToken, userController.blockUser); //toggle block user
router.put("/admin/approveuser/:id", verifyToken, userController.approveUser); //approve user
router.put("/admin/rejectuser/:id", verifyToken, userController.rejectUser); //reject user


module.exports = router;
