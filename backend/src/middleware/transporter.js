// src/functions/mailer.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env.dev" });
const env = process.env.NODE_ENV || "development";

if (env === "production") {
  dotenv.config({ path: ".env.prod" });
  console.log("Production env loaded");
} else {
  dotenv.config({ path: ".env.dev" });
  console.log("Development env loaded");
}

// Test
console.log("SENDER_MAIL:", process.env.SENDER_MAIL);
console.log("SENDER_PASSWORD:", process.env.SENDER_PASSWORD ? "Loaded ✅" : "Missing ❌");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASSWORD
  }
});

// ✅ Verify transporter
transporter.verify((err, success) => {
  if(err) console.log("SMTP Error:", err);
  else console.log("SMTP Ready");
});

export default transporter;
