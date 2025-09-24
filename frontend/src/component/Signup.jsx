import '../App.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import { signupUser } from "../api";
const backend = import.meta.env.VITE_BACKEND_URL;




const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Backend-compatible initial state
const [formData, setFormData] = useState({
  firstname: '',
  lastname: '',
  email: '',
  phoneno: '',
  password: '',
  address: { city: '', country: '' }
});


  // ✅ Input handler
const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "city" || name === "country") {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

// ✅ Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting formData:", formData); // ✅ check kya ja raha hai

  try {
    const res = await axios.post(
      `${backend}/api/user/register`,
      formData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Signup success:", res.data);
    alert(res.data.message || "Signup successful");
    navigate("/login"); // redirect to login page
  } catch (err) {
    console.error(
      "Signup failed:",
      err.response?.data?.message || err.message
    );
    alert(
      err.response?.data?.message || err.message || "Signup failed"
    );
  }
};

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-purple-800 to-purple-900 text-white p-6 sm:p-10 lg:p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 text-center lg:text-left">
          <div className="mb-6">
            <div className="text-3xl sm:text-4xl mb-2">📚</div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">BookNest</h1>
            <p className="text-base sm:text-lg text-blue-200">Your Literary Community</p>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-snug">
            Welcome to Your{' '}
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Reading Universe
            </span>
          </h2>

          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-200 leading-relaxed">
            Discover, share, and connect with fellow book lovers in our vibrant community
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40">
              📚 Share Books
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40">
              💬 Connect
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40">
              🌟 Discover
            </button>
          </div>

          <blockquote className="text-base sm:text-lg lg:text-xl italic text-gray-300 mb-2">
            "A reader lives a thousand lives before he dies..."
          </blockquote>
          <cite className="text-sm sm:text-base lg:text-lg text-blue-300 font-medium">
            — George R.R. Martin
          </cite>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Create Account For <span className="text-blue-600">BookNest</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Sign up to Exchange your Books with the world
            </p>
          </div>

          {/* ✅ Signup Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">First Name *</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">Last Name *</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-left">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-left">Phone *</label>
              <input
                type="text"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-left">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 font-semibold hover:bg-blue-700 transition"
            >
              Sign Up
            </button>

            <p className="text-center mt-3 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
