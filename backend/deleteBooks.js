import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ".env.dev" });
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzdkMmNhNGY3NGFjZWZiNzFiMWM3YiIsImlhdCI6MTc1NzkyNjA5MCwiZXhwIjoxNzU4NTMwODkwfQ.hjgyk4wYGhA08bVQpgwLn5OZzoCi2EhpXx8rlCuWUho"; 


try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Verified:", decoded);
} catch (err) {
  console.error("❌ JWT Verify Error:", err.message);
}



