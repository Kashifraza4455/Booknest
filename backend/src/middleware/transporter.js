

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     port: 587,
//     secure: false,
//     tls: {
//         ciphers: "SSLv3"
//     },
//     auth: {
//         // user: process.env.SENDER_MAIL,
//         // pass: process.env.SENDER_PASSWORD,
//         user: "saribnoor0310@gmail.com",
//         pass: "svct ivkb bsww qwsq",
//         // user: "pkhassanraza9@gmail.com",
//         // pass: "kejp dyuj fmvr ndkn",
//     }
// });

const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    tls: {
        ciphers: "SSLv3"
    },
    auth: {
        user: process.env.SENDER_MAIL,
        pass: process.env.SENDER_PASSWORD, // Must be an App Password
    }
});


module.exports = transporter;
