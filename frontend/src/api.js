// src/api.js
import axios from "axios";

// ✅ Base URL from environment
const backend = import.meta.env.VITE_BACKEND_URL;

// ====================== User APIs ======================

// Signup
export const signupUser = async (payload) => {
  return axios.post(`${backend}/api/user/register`, payload);
};

// Login
export const loginUser = async (payload) => {
  return axios.post(`${backend}/api/user/login`, payload);
};

export const sendVerification = async (email, frontendUrl) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.post(`${backendUrl}/api/user/sendvarification`, {
      email,        // ✅ string
      frontendUrl,  // ✅ string
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Send OTP
export const sendOtp = async (email) => {
  const res = await axios.post(`${backend}/api/user/send-otp`, { email });
  return res.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${backend}/api/user/verifyotp`, { email, otp });
  return res.data;
};

// Reset Password
export const resetPassword = (oldPassword, newPassword, token) => {
  return axios.post(
    `${backend}/api/user/resetPassword`,
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ header me token
      },
    }
  );
};

// ====================== Books APIs ======================

// Get Global Books
export const getGlobalBooks = async () => {
  try {
    const token = localStorage.getItem("token"); // jab login hota hai to token yahan save karo
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/books/global`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching books:", err);
    throw err;
  }
};

