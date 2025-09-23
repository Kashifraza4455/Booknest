//user controller
import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import transporter from'../middleware/transporter.js';
import otpmodel  from '../models/otpmodel.js'; 
import bcrypt from 'bcryptjs';
import validateEmail from "../functions/emailValidation.js";
import strongpass from'../functions/strongpass.js';
import Notification from '../models/notificationSchema.js';
import Wallet from '../models/userwallet.js';
import checkStrongPassword  from '../utils/validation.js';


import dotenv from 'dotenv';

dotenv.config();

const ipaddress = process.env.BASE_URL; // Localhost or production URL
const frontendUrl = "http://localhost:5173";

// Create user
console.log("checkStrongPassword function:", checkStrongPassword); 
export const createUser = async (req, res) => {
  console.log("Signup request body:", req.body);

  const { email, password, firstname, lastname, phoneno, address, isadmin } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    if (!validateEmail(email).isValid) return res.status(400).json({ message: "Invalid email" });

    const strongPassword = checkStrongPassword(password);
    if (!strongPassword.isStrong) {
      return res.status(400).json({ message: "Password is not strong enough", errors: strongPassword.errors });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      isadmin: isadmin || false,
      firstname,
      lastname,
      phoneno,
      email,
      password: hashPassword,
      address: { city: address?.city || "", country: address?.country || "" },
      tosAcceptance: { date: new Date(), ip: req.ip },
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("New user created:", newUser);

    res.status(201).json({ message: "User created successfully", data: newUser, token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------
// Send Verification Email
// ----------------------------
export const sendVerification = async (req, res) => {
  try {
    const { email, frontendUrl } = req.body;
    if (!email || !frontendUrl) return res.status(400).json({ message: "Email and frontendUrl required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    const verificationLink = `${frontendUrl}/api/user/verify/${token}`;

    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "BookNest Account Verification",
      html: `<div style="text-align:center"><h1>Verify Email</h1><a href="${verificationLink}">Click to Verify</a></div>`,
    });

    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ message: "Error sending verification email" });
  }
};

// ----------------------------
// Verify Email
// ----------------------------
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.id, { isverified: true, status: "Approved" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.status(200).send(`
      <div style="text-align:center; padding:20px;">
        <h1>Email Verified!</h1>
        <p>Your email has been successfully verified.</p>
        <a href="${frontendUrl}/login" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none;">Return to Login</a>
      </div>
    `);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------
// Login User
// ----------------------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });
    if (!user.isverified) return res.status(400).json({ message: "Please verify your email" });
    if (user.isBlocked) return res.status(400).json({ message: "Your account is suspended" });
    if (user.status === "Rejected") return res.status(400).json({ message: "Your account is rejected" });
    if (user.status !== "Approved") return res.status(400).json({ message: "Your account is under review" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    await transporter.sendMail({ from: process.env.SENDER_MAIL, to: user.email, subject: "Login Alert", text: "You have logged in successfully." });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.status(200).json({ email: user.email, token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------
// OTP
// ----------------------------
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const newotp = await otpmodel.create({ email, otp });

    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Password Reset OTP",
      html: `<div style="text-align:center"><h1>Password Reset OTP</h1><p>OTP: ${newotp.otp}</p><p>Valid for 5 minutes</p></div>`,
    });

    res.status(200).json({ message: "OTP sent successfully", email, otp: newotp.otp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpData = await otpmodel.findOne({ email, otp });
    if (!otpData) return res.status(400).json({ message: "Invalid OTP" });

    await otpData.deleteOne();
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Reset Password
// ----------------------------
export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;   // 👈 oldPassword add
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 👇 Pehle purana password match check karo
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const strongPassword = strongpass(newPassword);
    if (!strongPassword.isStrong) {
      return res.status(400).json({ message: "Password is not strong enough", errors: strongPassword.errors });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: user.email,
      subject: "Password Reset",
      text: "Your password has been reset successfully.",
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Add/remove book to/from wishlist
export const addToWishlist = async (req, res) => {
    const { bookId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.wishlist.includes(bookId)) {
            user.wishlist.pull(bookId);
            await user.save();
            return res.status(200).json({ message: "Book removed from wishlist successfully" });
        }

        user.wishlist.push(bookId);
        await user.save();
        res.status(200).json({ message: "Book added to wishlist successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// usercontroller.js
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ data: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ----------------------------
// Notifications
// ----------------------------

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const notifications = await Notification.find({ reciever: userId }).populate('sender');
        res.status(200).json({ data: notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ----------------------------
// Admin Functions
// ----------------------------

// Get number of users (with filters)
export const getNumberOfUsers = async (req, res) => {
    const { total, isverified, isactive, isBlocked, isApproved, isPending, isRejected } = req.query;

    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.isadmin) return res.status(403).json({ message: 'You are not authorized' });

        if (total) {
            const users = await User.find();
            return res.status(200).json({ totalusers: users.length });
        }
        if (isverified) {
            const users = await User.find({ isverified });
            return res.status(200).json({ verifiedusers: users.length });
        }
        if (isactive) {
            const users = await User.find({ isBlocked: false });
            return res.status(200).json({ activeusers: users.length });
        }
        if (isBlocked) {
            const users = await User.find({ isBlocked: true });
            return res.status(200).json({ blockedusers: users.length });
        }
        if (isApproved) {
            const users = await User.find({ status: 'Approved' });
            return res.status(200).json({ approvedusers: users.length });
        }
        if (isPending) {
            const users = await User.find({ status: 'Pending' });
            return res.status(200).json({ pendingusers: users.length });
        }
        if (isRejected) {
            const users = await User.find({ status: 'Rejected' });
            return res.status(200).json({ rejectedusers: users.length });
        }

        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User engagement statistics
export const userEngagement = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.isadmin) return res.status(401).json({ message: 'You are not authorized' });

        const currentYear = new Date().getFullYear();

        const usersPerMonth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) }
                }
            },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyUsers = Array(12).fill(0);
        usersPerMonth.forEach(({ _id, count }) => monthlyUsers[_id - 1] = count);

        res.status(200).json({
            year: currentYear,
            monthlyRegistrations: {
                January: monthlyUsers[0],
                February: monthlyUsers[1],
                March: monthlyUsers[2],
                April: monthlyUsers[3],
                May: monthlyUsers[4],
                June: monthlyUsers[5],
                July: monthlyUsers[6],
                August: monthlyUsers[7],
                September: monthlyUsers[8],
                October: monthlyUsers[9],
                November: monthlyUsers[10],
                December: monthlyUsers[11]
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Recently registered users (limit 5)
export const recentlyRegisteredUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.isadmin) return res.status(401).json({ message: 'You are not authorized' });

        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        res.status(200).json({ recentlyjoined: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users in descending order
export const getAllUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.isadmin) return res.status(401).json({ message: 'You are not authorized' });

        const users = await User.find({ isadmin: false }).sort({ createdAt: -1 });
        res.status(200).json({ allusers: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search users
export const searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
        if (!query) return res.status(400).json({ message: "Search query is required" });

        const regex = new RegExp(query, "i");
        const users = await User.find({
            $or: [
                { firstname: regex },
                { lastname: regex },
                { email: regex },
                { phoneno: regex }
            ]
        });

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Block/unblock user
export const blockUser = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin.isadmin) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve user
export const approveUser = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin.isadmin) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = 'Approved';
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Account Approved",
            text: "Your account has been approved. You can now login."
        });

        await user.save();
        res.status(200).json({ message: "User approved successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject user
export const rejectUser = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin.isadmin) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = 'Rejected';
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Account Rejected",
            text: "Your account has been rejected. You can contact admin for details."
        });

        await user.save();
        res.status(200).json({ message: "User rejected successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ----------------------------
// Requests
// ----------------------------

export const getRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('sentrequests')
            .populate('recieivedrequests.user')
            .populate('recieivedrequests.book');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ sentrequests: user.sentrequests, recieivedrequests: user.recieivedrequests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};