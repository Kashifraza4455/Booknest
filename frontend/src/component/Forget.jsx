import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../api"; 

export default function SendOtp() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await sendOtp(email);
      if (res.message === "OTP sent successfully") {
        navigate("/reset", { state: { email } });
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left side - Welcome section */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-blue-900 via-purple-800 to-purple-900 text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Background decoration dots */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-white opacity-30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white opacity-20 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white opacity-25 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-white opacity-30 rounded-full"></div>

        <div className="relative z-10">
          <div className="mb-8 text-left">
            <div className="text-4xl mb-2">📚</div>
            <h1 className="text-4xl font-bold mb-2">BookNest</h1>
            <p className="text-lg text-blue-200">Your Literary Community</p>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome to Your{" "}
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Reading Universe
            </span>
          </h2>

          <p className="mb-8 text-xl text-gray-200 leading-relaxed">
            Discover, share, and connect with fellow book lovers in our vibrant
            community
          </p>

          <div className="flex gap-4 mb-8">
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
              📚 Share Books
            </button>
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
              💬 Connect
            </button>
            <button className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 px-6 py-3 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transform hover:scale-105">
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

      {/* Right side - Send OTP form */}
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col justify-center items-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50">
              <span className="text-gray-600 text-lg">←</span>
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-left">
              Forgot Password
            </h2>
            <p className="text-gray-500 text-base text-left">
              Enter your Email to reset Password
            </p>
          </div>

          <div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  ✉️
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
