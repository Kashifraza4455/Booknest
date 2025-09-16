// src/api.js
import axios from "axios";

// Base URL from environment
const backend = import.meta.env.VITE_RENDER_BACKEND;

// Signup
export const signupUser = async (payload) => {
  return axios.post(`${backend}/api/user/signup`, payload);
};

// Login
export const loginUser = async (payload) => {
  return axios.post(`${backend}/api/user/login`, payload);
};

// Send verification / OTP
export const sendVerification = async (payload) => {
  return axios.post(`${backend}/api/user/send-verification`, payload);
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
// Change password
export const changePassword = async (oldPassword, newPassword, token) => {
  const res = await axios.post(
    `${backend}/api/user/change-password`,
    { oldPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};


// Fetch global books
export const getGlobalBooks = async (token) => {
  const res = await axios.get(`${backend}/api/books/global`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.books;
};
