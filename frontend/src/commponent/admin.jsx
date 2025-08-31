import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function BookNestAdminPortal() {
  const [email, setEmail] = useState('admin@booknest.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Welcome section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-16">
        {/* BookNest Card */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl p-8 mb-12 w-80 h-64 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-bold">BookNest</h2>
            <p className="text-white text-opacity-80 text-sm">Your Digital Library</p>
          </div>
          
          {/* Stars decoration */}
          <div className="absolute top-16 left-8 text-white text-opacity-60">✦</div>
          <div className="absolute top-20 right-12 text-white text-opacity-60">✦</div>
          
          {/* Books illustration */}
          <div className="flex justify-center items-end space-x-1 mt-8">
            <div className="w-6 h-16 bg-red-400 rounded-t-sm"></div>
            <div className="w-6 h-20 bg-green-400 rounded-t-sm"></div>
            <div className="w-6 h-12 bg-yellow-300 rounded-t-sm"></div>
            <div className="w-6 h-18 bg-blue-300 rounded-t-sm"></div>
            <div className="w-6 h-14 bg-pink-400 rounded-t-sm"></div>
            <div className="w-6 h-22 bg-red-400 rounded-t-sm"></div>
            <div className="w-6 h-16 bg-green-400 rounded-t-sm"></div>
            <div className="w-6 h-18 bg-green-300 rounded-t-sm"></div>
          </div>
        </div>

        {/* Welcome text */}
        <div className="text-center max-w-md">
          <h1 className="text-white text-4xl font-bold mb-4">Welcome to BookNest</h1>
          <p className="text-gray-400 text-lg">Your Gateway to Digital Knowledge</p>
        </div>
      </div>
      
      {/* Right side - Admin Portal */}
      <div className="w-[480px] bg-white flex flex-col justify-center px-12">
        {/* Admin icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-gray-500">Secure access to your dashboard</p>
        </div>
        
        {/* Sign In Form */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In</h3>
          <p className="text-gray-500 mb-6">Enter your credentials to access the admin portal</p>
          
          {/* Email field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
          
          {/* Password field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Sign in button */}
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>SIGN IN TO ADMIN PORTAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}