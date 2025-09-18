// src/api.js
import axios from "axios";
const API_URL = "http://localhost:3000"; // backend URL

// Base URL from environment
const backend = import.meta.env.VITE_RENDER_BACKEND;

// Signup
export const signupUser = async (payload) => {
  return axios.post(`${backend}/api/user/register`, payload);
};

// Login
export const loginUser = async (payload) => {
  return axios.post(`${backend}/api/user/login`, payload);
};

// Send verification / OTP
export const sendVerification = async (payload) => {
  return axios.post(`${backend}/api/user/sendvarification`, payload);
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
export const changePassword = async (oldPassword, newPassword, token) => {
  return axios.post(
    `${backend}/api/user/change-password`,
    { oldPassword, newPassword }, // body
    {
      headers: {
        Authorization: `Bearer ${token}`, // token bhejna zaroori hai
      },
    }
  );
};


export const getGlobalBooks = async () => {
  const token = localStorage.getItem("token"); // ✅ token exists
  if (!token) throw new Error("User not authenticated");

  const response = await axios.get(`${API_URL}/api/books/global`, {
    headers: {
      Authorization: `Bearer ${token}` // ✅ Bearer prefix included
    }
  });

  return response.data;
};


