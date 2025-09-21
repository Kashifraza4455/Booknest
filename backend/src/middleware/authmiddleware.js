import jwt from "jsonwebtoken"; // ✅ ESM syntax
import dotenv from "dotenv";
dotenv.config(); // Load environment variables


const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader);

  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {   // ✅ Yahan wahi use karo jo .env me hai
    if (err) {
      console.error("JWT Verify Error:", err);
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// ✅ Export ESM style
export default verifyToken;
