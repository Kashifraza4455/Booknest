import axios from "axios";

// ✅ Base URL from environment (dev / production)
const backend = import.meta.env.VITE_BACKEND_URL;

// ====================== User APIs ======================

// Signup
console.log("Backend URL in frontend:", backend);
export const signupUser = async (payload) => {
  try {
    const res = await axios.post(`${backend}/api/user/register`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Login
export const loginUser = async (payload) => {
  try {
    const res = await axios.post(`${backend}/api/user/login`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Send Verification Email
export const sendVerification = async (email, frontendUrl) => {
  try {
    const res = await axios.post(`${backend}/api/user/sendvarification`, {
      email,        // ✅ string only
      frontendUrl,  // ✅ frontend URL
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Send OTP
export const sendOtp = async (email) => {
  try {
    const res = await axios.post(`${backend}/api/user/send-otp`, { email });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const res = await axios.post(`${backend}/api/user/verifyotp`, { email, otp });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// Reset Password
export const resetPassword = async (oldPassword, newPassword, token) => {
  try {
    const res = await axios.post(
      `${backend}/api/user/resetPassword`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ token header
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ====================== Books APIs ======================

// Get Global Books
export const getGlobalBooks = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${backend}/api/books/global`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching books:", err);
    throw err.response?.data || err.message;
  }
};
