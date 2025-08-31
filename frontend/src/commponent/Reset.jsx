import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookNest() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // Email passed from Send OTP screen

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP function
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    try {
      setError('');
      const res = await axios.post('http://localhost:3000/api/user/verifyotp', {
        email,
        otp: enteredOtp
      });

      if (res.data.message === "OTP verified successfully") {
        navigate('/password', { state: { email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-purple-900 flex">
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

      {/* Right Section - OTP Verification */}
      <div className="flex-1 bg-white p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex justify-start mb-4">
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2 text-left">
                Verify <span className="text-blue-600">OTP</span>
              </h3>
              <p className="text-gray-500 text-left">
                An <span className="font-semibold text-gray-700 ">OTP</span> has been sent to your email
              </p>
            </div>
          </div>

          {/* OTP Input Fields */}
          <div className="flex gap-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 border-2 border-gray-200 rounded-lg text-center text-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          {/* Resend Button */}
          <div className="text-left mb-4">
            <button
              onClick={async () => {
                try {
                  await axios.post('/api/user/send-otp', { email });
                  alert('OTP resent successfully');
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to resend OTP');
                }
              }}
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Resend
            </button>
          </div>

          {/* Verify Button */}
          <div className="text-left">
            <button
              onClick={handleVerifyOtp}
              className="px-20 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              Verify OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
