const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
//importing verify token


const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Get token from headers

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Attach user data to request
        console.log(req.user);
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ Export the middleware properly
module.exports = verifyToken;
