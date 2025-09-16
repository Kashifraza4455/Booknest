// src/api.js
import axios from "axios";

const API = process.env.REACT_APP_API_URL; // Vercel environment variable

// Signup
export const signupUser = async (payload) => {
  const res = await axios.post(`${API}/signup`, payload);
  return res.data;
};

// Login
export const loginUser = async (payload) => {
  const res = await axios.post(`${API}/login`, payload);
  return res.data;
};

// Send verification email
export const sendVerification = async (email) => {
  const res = await axios.post(`${API}/api/user/sendvarification`, { email });
  return res.data;
};

// Send OTP
export const sendOtp = async (email) => {
  const res = await axios.post(`${API}/api/user/send-otp`, { email });
  return res.data;
};
// Verify OTP
export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${API}/api/user/verifyotp`, { email, otp });
  return res.data;
};
// Change password
export const changePassword = async (oldPassword, newPassword, token) => {
  const res = await axios.post(
    `${API}/api/user/change-password`,
    { oldPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};


// Fetch global books
export const getGlobalBooks = async (token) => {
  const res = await axios.get(`${API}/api/books/global`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.books;
};
