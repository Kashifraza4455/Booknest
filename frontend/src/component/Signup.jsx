import '../App.css'
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError, clearSuccess } from '../store/slices/authSlice';
import { signupUser as signupAPI } from '../api'; 

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: ''
  });

  const handleInputChange = (e) => {
    if (error) dispatch(clearError());
    if (success) dispatch(clearSuccess());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    firstname: formData.firstName,
    lastname: formData.lastName,
    email: formData.email,
    phoneno: formData.phone,
    password: formData.password,
    address: {
      city: formData.city,
      country: formData.country
    },
    isadmin: false
  };

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_RENDER_BACKEND}/api/user/signup`,
      payload
    );

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      password: ''
    });

    setTimeout(() => navigate("/login"), 1500);
  } catch (err) {
    console.error("Signup failed:", err);
  }
};


  return (
    <div className="flex min-h-screen ">
      {/* Left Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-purple-800 to-purple-900 text-white p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Background decoration dots */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-white opacity-30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white opacity-20 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white opacity-25 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-white opacity-30 rounded-full"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8 text-left">
            <div className="text-4xl mb-2">📚</div>
            <h1 className="text-4xl font-bold mb-2">BookNest</h1>
            <p className="text-lg text-blue-200">Your Literary Community</p>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome to Your{' '}
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Reading Universe
            </span>
          </h2>
          
          <p className="mb-8 text-xl text-gray-200 leading-relaxed">
            Discover, share, and connect with fellow book lovers in our vibrant community
          </p>

          <div className="flex gap-4 mb-8">
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg flex items-center gap-2 border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
              📚 Share Books
            </button>
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg flex items-center gap-2 border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
              💬 Connect
            </button>
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg flex items-center gap-2 border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
              🌟 Discover
            </button>
          </div>

          <blockquote className="text-xl font-light italic text-gray-300 mb-2">
            "A reader lives a thousand lives before he dies..."
          </blockquote>
          <cite className="text-lg text-blue-300 font-medium">
            — George R.R. Martin
          </cite>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          {/* Heading + Subheading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Create Account For <span className="text-blue-600">BookNest</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Sign up to Exchange your Books with the world
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Account created successfully! You can now log in.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Row: First + Last Name */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">
                  First Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">👤</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">
                  Last Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">👤</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-left">
                Email *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-left">
                Phone *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">📞</span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row: City + Country */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">
                  City *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">🏙️</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-left">
                  Country *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">🌍</span>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country"
                    className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-left">
                Password *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* SignUp Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <p className="text-center mt-3 text-sm">
              Already have an account?{" "}
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
