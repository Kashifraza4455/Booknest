import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loginUser } from "../store/slices/authSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate("/books"); // Redirect after successful login
  }, [user, navigate]);

  // Handle Login
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await dispatch(loginUser({ email, password })).unwrap();
    console.log("Login successful:", result);

    // ✅ token ko localStorage me save karo
    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    navigate("/books"); // redirect
  } catch (err) {
    console.error("Login failed:", err);
  }
};




  // Handle sending verification email
const handleSendVerification = async () => {
  if (!email) {
    setVerificationMessage("Please enter your email first");
    return;
  }
  setLoadingVerification(true);
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user/sendvarification`, 
      { email }
    );
    setVerificationMessage(res.data.message);
  } catch (err) {
    console.error(err);
    setVerificationMessage(
      err.response?.data?.message || "Error sending verification email"
    );
  }
  setLoadingVerification(false);
};


  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
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

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-b from-white to-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Log in to share your Books with the world</p>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 mb-4 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1 text-left">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-left">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <span
                  className="absolute right-3 top-2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-lg text-white font-semibold ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "SIGN IN"}
            </button>
          </form>

          <div className="flex justify-between text-sm mt-4">
            {/* Send Verification Button */}
            <button
              onClick={handleSendVerification}
              className="text-blue-500 underline"
              disabled={loadingVerification}
            >
              {loadingVerification ? "Sending..." : "Send Verification Link"}
            </button>

            <Link to="/forget" className="text-blue-500">Forget Password?</Link>
          </div>

          {/* Verification feedback */}
          {verificationMessage && (
            <p className="text-green-600 mt-2">{verificationMessage}</p>
          )}

          <div className="text-center mt-4 text-gray-500">
            OR
            <p>
              Don't have an Account? <Link to="/signup" className="text-blue-500 font-medium">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
