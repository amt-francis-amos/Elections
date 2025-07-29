import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const from = location.state?.from?.pathname || '/';

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.id.trim()) {
      showNotification("User ID is required", "error");
      return false;
    }
    if (!formData.password) {
      showNotification("Password is required", "error");
      return false;
    }
    return true;
  };

  const handleRoleBasedRedirect = (user) => {
    if (user.role === "admin") {
      showNotification("Welcome, Admin! Redirecting...", "success");
      setTimeout(() => navigate("/admin"), 1500);
    } else if (user.role === "voter") {
      showNotification("Welcome, Voter! Redirecting...", "success");
      const redirectPath = from === '/login' ? '/vote' : from;
      setTimeout(() => navigate(redirectPath), 1500);
    } else {
      showNotification("Unknown role. Redirecting to home.", "warning");
      setTimeout(() => navigate("/"), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const loginUrl = "https://elections-backend-j8m8.onrender.com/api/users/login";

    try {
      const payload = { 
        id: formData.id.trim(), 
        password: formData.password 
      };

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user } = data;
      
      if (!token || !user) throw new Error("Invalid login response");

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      showNotification("Login successful!", "success");
      setFormData({ id: "", password: "" });
      handleRoleBasedRedirect(user);
      
    } catch (err) {
      const msg = err.message || "Something went wrong";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle background click to navigate back to home
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate('/');
    }
  };

  return (
    <>
      {/* Blurred Background Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 py-8"
        onClick={handleBackgroundClick}
      >
        {/* Login Form Container */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to access the Election System
            </p>
          </div>

          {/* Notification */}
          {notification.message && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              notification.type === "error" ? "bg-red-50 text-red-800 border border-red-200" :
              notification.type === "success" ? "bg-green-50 text-green-800 border border-green-200" :
              notification.type === "warning" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" :
              "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              <div className="flex items-center">
                {notification.type === "error" && (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "success" && (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.message}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID Field */}
            <div className="relative">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full px-4 pt-5 pb-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-600 transition-all duration-200 font-medium">
                User ID
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full px-4 pt-5 pb-2 pr-10 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-600 transition-all duration-200 font-medium">
                Password
              </label>
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs text-gray-700 font-medium mb-0.5">
                  Access Information
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Only registered users can access the system. Voters must receive their credentials from an administrator. Contact support if you need assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Login Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;