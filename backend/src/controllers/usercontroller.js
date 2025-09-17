//user controller
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const transporter = require('../middleware/transporter');
const otpmodel = require('../models/otpmodel'); 
const bcrypt = require('bcrypt');
const validateEmail = require("../functions/emailValidation");
const checkStrongPassword = require('../functions/strongpass');
const Notification = require('../models/notificationSchema');
const Wallet = require('../models/userwallet');

const dotenv = require('dotenv');
dotenv.config();

const ipaddress = process.env.BASE_URL; // Localhost or production URL
const frontendUrl = "http://localhost:5173";

// Create user
exports.createUser = async (req, res) => {
    const { email, password, firstname, lastname, phoneno, address, isadmin } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const emailValidation = validateEmail(email);
        if(!emailValidation.isValid) return res.status(400).json({ message: 'Invalid email' });

        const strongPassword = checkStrongPassword(password);
        if(!strongPassword.isStrong) return res.status(400).json({ message: 'Password is not strong enough', errors: strongPassword.errors });

        const hashpassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            isadmin: isadmin,
            firstname,
            lastname,
            phoneno,
            email,
            password: hashpassword,
            address: {
                city: address?.city || '',
                country: address?.country || ''
            },
            tosAcceptance: {
                date: new Date(),
                ip: req.ip
            }
        });

        // ✅ Token generate
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // ✅ Response me user aur token bhejna
        res.status(201).json({ 
            message: 'User created successfully', 
            data: newUser,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Send verification email
// Send verification email
exports.sendVerification = async (req, res) => {
     console.log("📩 Email received for verification:", req.body.email);
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // JWT token valid for 30 days
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '30d' });

        // ✅ Add verification link here
        // userController.js
        const verificationLink = `${process.env.BACKEND_URL}/api/user/verify/${token}`;


        // Send email
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "BookNest Account Verification",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Email Verification</h1>
                    <p style="color: #666; margin: 20px 0;">Please click the button below to verify your email address:</p>
                   <a href="${verificationLink}" 
   style="background-color: #4CAF50; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 5px; 
          display: inline-block;
          margin: 20px 0;">
    Verify Email
</a>

                    <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link:</p>
                    <p style="color: #666; font-size: 12px;">${verificationLink}</p>

                </div>
            </div>
            `
        });

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({ message: 'Error sending verification email' });
    }
};


// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Update user in one step
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { isverified: true, status: "Approved" },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send final HTML with button to frontend login
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        res.status(200).send(`
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 32px 24px; border-radius: 10px; text-align: center; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="margin: 30px 0;">
                        <img src="https://img.icons8.com/color/96/000000/verified-account.png" alt="Email Verified" style="width: 80px; height: 80px; margin: 0 auto 24px auto; display: block;">
                    </div>
                    <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Email Verified!</h1>
                    <p style="color: #4b5563; margin-bottom: 32px; font-size: 16px;">Your email has been successfully verified.</p>
                    <a href="${frontendUrl}/login" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
                        Return to Login
                    </a>
                </div>
            </div>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};





// LOGIN USER
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    if (!user.isverified) return res.status(400).json({ message: 'Please verify your email' });
    if (user.isBlocked) return res.status(400).json({ message: 'Your account is suspended' });
    if (user.status === 'Rejected') return res.status(400).json({ message: 'Your account is rejected' });

    // Allow login if status is Approved
    if (user.status !== 'Approved') {
      return res.status(400).json({ message: 'Your account is under review' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

    // Optional: send login alert email
    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: user.email,
      subject: "Login Alert",
      text: `You have logged in successfully.`,
    });

    // ✅ Generate JWT token with proper secret
    const token = jwt.sign(
      { id: user._id, email: user.email },       // payload
      process.env.SECRET_KEY,                    // secret (same in verifyJWT)
      { expiresIn: '30d' }                       // expiry
    );

    res.status(200).json({ email: user.email, token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


//get user info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//update user info by authenticating via bearer-token, all fields are optional
exports.uploadProfile = async (req, res) => {
    const { firstname, lastname, phoneno, city, country} = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (phoneno) user.phoneno = phoneno;
        if (city && country) {
            user.address.city = city || user.address.city;
            user.address.country = country || user.address.country;
        }
        if (req.file) {
            user.profileimage = req.file.path;
        }
        //send email update allert
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Profile Update",
            text: `Your profile has been updated successfully.`,
        });
        await user.save();
        res.status(200).json({ message: 'User updated successfully', data: user });
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//upload profile
// exports.uploadProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }
//         if (!req.file) {
//             return res.status(400).json({ msg: 'No file uploaded' });
//         }
//         user.profileimage = req.file.path;
//         await user.save();
//         res.status(200).json({ msg: 'Profile uploaded successfully', data: user });
//     }catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log("Request body:", req.body);

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//create 6 digit otp
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        // Save OTP to database with email
        const newotp = await otpmodel.create({ email, otp });
        console.log(newotp, 'new otp sending');

        // Send email using transporter
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Password Reset OTP",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Password Reset OTP</h1>
                    <p style="color: #666; margin: 20px 0;">Your One-Time Password (OTP) for password reset is:</p>
                    <div style="background-color: #f8f8f8; 
                               padding: 15px; 
                               border-radius: 5px; 
                               margin: 20px auto;
                               display: inline-block;
                               font-size: 24px;
                               font-weight: bold;
                               color: #4CAF50;
                               letter-spacing: 2px;">
                        ${newotp.otp}
                    </div>
                    <p style="color: #999; font-size: 14px;">This OTP is valid for 5 minutes.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">For security reasons, please do not share this OTP with anyone.</p>
                </div>
            </div>
            `,
        });
        
        res.status(200).json({ message: "OTP sent successfully", email , otp: newotp.otp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//verify otp
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpData = await otpmodel.findOne({ email, otp });
        if (!otpData) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // Delete the OTP record from the database
        await otpData.deleteOne();
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//reset password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        //check for strong password
        const strongPassword = checkStrongPassword(newPassword);
        if(!strongPassword.isStrong){
            return res.status(400).json({ message: 'Password is not strong enough', errors: strongPassword.errors });
        }

        //send reset password allert
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Password Reset",
            text: `Your password has been reset successfully.`,
        });

        const hashpassword = await bcrypt.hash(newPassword, 10);
        user.password = hashpassword;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//add book to wish list
exports.addToWishlist = async (req, res) => {
    const { bookId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        //if book already exists in wishlist
        if(user.wishlist.includes(bookId)){
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

//get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ data: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//get notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        //find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const notifications = await Notification.find({ reciever: userId }).populate('sender');
        res.status(200).json({ data: notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// //admin apis

//get number of total registered users
exports.getnumberofUsers = async (req, res) => {
    //get number of total, non-verified users
    const {total, isverified, isactive, isBlocked, isApproved, isPending, isRejected} = req.query;
    try {
        //check if user is admin
        const currentuser = await User.findById(req.user.id);
        if (!currentuser.isadmin) {
            return res.status(403).json({ message: 'You are not authorized' });
        }

        
        if(total){
            const users = await User.find();
            return res.status(200).json({ totalusers: users.length });
        }
        if(isverified){
            const users = await User.find({ isverified });
            return res.status(200).json({ verifiedusers: users.length });
        }
        if(isactive){
            const users = await User.find({ isBlocked: false });
            return res.status(200).json({ activeusers: users.length });
        }
        if(isBlocked){
            const users = await User.find({ isBlocked: true });
            return res.status(200).json({ blockedusers: users.length });
        }
        if(isApproved){
            const users = await User.find({ status: 'Approved' });
            return res.status(200).json({ approvedusers: users.length });
        }
        if(isPending){
            const users = await User.find({ status: 'Pending' });
            return res.status(200).json({ pendingusers: users.length });
        }
        if(isRejected){
            const users = await User.find({ status: 'Rejected' });
            return res.status(200).json({ rejectedusers: users.length });
        }

        const users = await User.find();
        res.status(200).json({ users  });
        // res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//user engagment  
exports.userEngagement = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(!user.isadmin){
            return res.status(401).json({ message: 'You are not authorized to access this route' });
        }

        // Get the current year
        const currentYear = new Date().getFullYear();

        // Aggregate to count users per month
        const usersPerMonth = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`), // Start of current year
                        $lt: new Date(`${currentYear + 1}-01-01`) // Start of next year
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Group by month
                    count: { $sum: 1 } // Count users per month
                }
            },
            { $sort: { "_id": 1 } } // Sort by month
        ]);

        // Convert aggregation result to a full-year structure
        const monthlyUsers = Array(12).fill(0);
        usersPerMonth.forEach(({ _id, count }) => {
            monthlyUsers[_id - 1] = count; // _id is month (1-12), array index is (0-11)
        });

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


//recently registered users upto five
exports.recentlyRegisteredUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId);
        if (!currentUser.isadmin) {
            return res.status(401).json({ message: 'You are not authorized to access this route' });
            }
        const user = await User.find().sort({ createdAt: -1 }).limit(5);
        res.status(200).json({ recentlyjoined: user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//get all users in desending order
exports.getallusers = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId);
        if (!currentUser.isadmin) {
            return res.status(401).json({ message: 'You are not authorized to access this route' });
            }
            
            let isadmin = { isadmin: false };
        const user = await User.find(isadmin).sort({ createdAt: -1 });
        res.status(200).json({ allusers: user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//search users using regex 
exports.searchUsers = async (req, res) => {
    const { query } = req.query; // Get search query from request
    try {
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Case-insensitive regex search pattern
        const regex = new RegExp(query, "i");

        // Search criteria (excluding `isBlocked`, `wishlist`, etc.)
        const users = await User.find({
            $or: [
                { firstname: regex },
                { lastname: regex },
                { email: regex },
                { phoneno: regex },
            ]
        }); // Exclude password & wishlist in results

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


//block user toggle
exports.blockUser = async (req, res) => {
    try {
        const AdminId = req.user.id;

        const admin = await User.findById(AdminId);
        if (!admin.isadmin) {
            return res.status(401).json({ message: 'You are not authorized to access this route' });
        }
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//approve user
exports.approveUser = async (req, res) => {
    try {
        const AdminId = req.user.id;
        const admin = await User.findById(AdminId);
        if (!admin.isadmin) {
            return res.status(401).json({ message: 'You are not authorized to access this route' });
        }
        const userId = req.params.id;
        const user = await User
            .findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.status = 'Approved';
        //send mail
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "accout approved",
             text: `Your account has been approved. You can now login to your account.`,
            //  text: `Click the link to verify your email: ${ngrokurl}/booknest/users/verify/${token}`,
        });

        await user.save();
        res.status(200).json({ message: "User approved successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//reject user
exports.rejectUser = async (req, res) => {
    try {
        const AdminId = req.user.id;
        const admin = await User.findById(AdminId);
        if (!admin.isadmin) {
            return res.status(401).json({ message: 'You are not authorized to access this route' });
        }
        const userId = req.params.id;
        const user = await User
            .findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.status = 'Rejected';
        //send mail
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "accout rejected",
             text: `Your account has been rejected. You can contact admin for more details.`,
            //  text: `Click the link to verify your email: ${ngrokurl}/booknest/users/verify/${token}`,
        });
        await user.save();
        res.status(200).json({ message: "User rejected successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};




//get sent requests and recieved requests
exports.getRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('sentrequests').populate('recieivedrequests.user').populate('recieivedrequests.book');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ sentrequests: user.sentrequests, recieivedrequests: user.recieivedrequests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};