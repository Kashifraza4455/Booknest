const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,       // apka Gmail
    pass: process.env.SENDER_PASSWORD    // 16-digit App Password
  }
});

module.exports = transporter;
