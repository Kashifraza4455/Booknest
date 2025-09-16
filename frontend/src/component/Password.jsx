import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api'; // api.js ka path

export default function BookNestScreen() {
   const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token'); // JWT from login
      if (!token) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      const res = await changePassword(oldPassword, newPassword, token); // ✅ Render backend se connect

      alert(res.message);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex">
      {/* Left Side - Welcome Section */}
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

      {/* Right Side - Password Reset Form */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center px-12">
        <div className="w-full max-w-xs">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-left">Change Password</h3>
            <p className="text-gray-500 text-left">Enter your old password and set a new one</p>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="space-y-6">
            {/* Old Password */}
            <div>
              <div className="block text-gray-700 font-medium mb-2 text-left">Old Password <span className="text-red-500">*</span></div>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="block text-gray-700 font-medium mb-2 text-left">New Password <span className="text-red-500">*</span></div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="block text-gray-700 font-medium mb-2 text-left">Confirm Password <span className="text-red-500">*</span></div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
