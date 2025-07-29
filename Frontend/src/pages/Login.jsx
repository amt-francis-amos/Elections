import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = ({
  isOpen = true, // Default to true for page usage
  onClose = () => {}, // Default empty function for page usage
  onLoginSuccess,
  navigate: propNavigate,
  router,
  redirectMethod = "navigate",
}) => {
  const routerNavigate = useNavigate();
  const location = useLocation();
  
  // Use the navigate prop if provided (modal usage), otherwise use router navigate (page usage)
  const navigate = propNavigate || routerNavigate;
  
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Get the page user was trying to access (for page usage)
  const from = location.state?.from?.pathname || '/';

  // Determine if this is being used as a page or modal
  const isPageMode = !propNavigate && onClose.toString() === '() => {}';

  // Show notification
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
      setTimeout(() => redirectTo("/admin"), 1500);
    } else if (user.role === "voter") {
      showNotification("Welcome, Voter! Redirecting...", "success");
      // For page mode, respect the 'from' location
      const redirectPath = isPageMode && from !== '/login' ? from : "/vote";
      setTimeout(() => redirectTo(redirectPath), 1500);
    } else {
      showNotification("Unknown role. Redirecting to home.", "warning");
      setTimeout(() => redirectTo("/"), 1500);
    }
  };

  const redirectTo = (path) => {
    if (redirectMethod === "navigate" && navigate) {
      navigate(path);
    } else if (redirectMethod === "router" && router) {
      router.push(path);
    } else {
      window.location.href = path;
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

      // Store auth data based on usage mode
      if (isPageMode) {
        // For page mode, use localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        // For modal mode, use window.authData as in original
        window.authData = { token, user };
      }

      showNotification("Login successful!", "success");
      if (onLoginSuccess) onLoginSuccess({ user, token });
      
      // Only call onClose for modal mode
      if (!isPageMode && onClose) onClose();
      
      setFormData({ id: "", password: "" });
      handleRoleBasedRedirect(user);
      
    } catch (err) {
      const msg = err.message || "Something went wrong";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle background click (page mode only)
  const handleBackgroundClick = (e) => {
    if (isPageMode && e.target === e.currentTarget) {
      navigate('/');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`${
          isPageMode 
            ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 py-8' 
            : 'fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4'
        }`}
        onClick={isPageMode ? handleBackgroundClick : undefined}
      >
        <div className={`bg-white rounded-2xl w-full max-w-md shadow-2xl relative ${
          isPageMode 
            ? 'p-8 sm:p-10 rounded-3xl border border-gray-100 max-h-[90vh] overflow-y-auto' 
            : 'p-6 sm:p-8'
        }`}>
          
          {/* Close Button */}
          <button
            onClick={isPageMode ? () => navigate('/') : onClose}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors duration-200"
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div className={`text-center ${isPageMode ? 'mb-6' : 'mb-6'}`}>
            {isPageMode && (
              <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
            <h2 className={`font-bold text-center text-gray-800 ${
              isPageMode ? 'text-2xl mb-1' : 'text-2xl mb-2'
            }`}>
              {isPageMode ? 'Welcome Back' : 'Election System Login'}
            </h2>
            {isPageMode && (
              <p className="text-sm text-gray-600">
                Sign in to access the Election System
              </p>
            )}
          </div>

          {/* Notification */}
          {notification.message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              notification.type === "error" ? "bg-red-100 text-red-700 border border-red-300" :
              notification.type === "success" ? "bg-green-100 text-green-700 border border-green-300" :
              notification.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
              "bg-blue-100 text-blue-700 border border-blue-300"
            }`}>
              {isPageMode && (
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
                </div>
              )}
              {notification.message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={isPageMode ? "space-y-4" : "space-y-6"}>
            {/* User ID Field */}
            <div className="relative">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder=" "
                required
                className={`peer w-full px-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  isPageMode 
                    ? 'pt-5 pb-2 border-2 border-gray-200 rounded-lg focus:border-transparent' 
                    : 'pt-6 pb-2 border border-gray-300 rounded-md'
                }`}
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all font-medium">
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
                className={`peer w-full px-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  isPageMode 
                    ? 'pt-5 pb-2 pr-10 border-2 border-gray-200 rounded-lg focus:border-transparent' 
                    : 'pt-6 pb-2 border border-gray-300 rounded-md'
                }`}
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all font-medium">
                Password
              </label>
              <button
                type="button"
                className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200 ${
                  isPageMode ? 'right-3 p-1' : 'right-4'
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isPageMode 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 px-4 rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-indigo-600 py-2 rounded-lg hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  {isPageMode && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isPageMode ? "Signing in..." : "Logging in..."}
                </div>
              ) : (
                isPageMode ? "Sign In" : "Login"
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className={`p-4 bg-gray-50 rounded-lg ${isPageMode ? 'mt-6 border border-gray-100' : 'mt-6'}`}>
            {isPageMode ? (
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
            ) : (
              <p className="text-xs text-gray-600 text-center">
                <strong>Note:</strong> Only registered users can login. 
                Voters must receive their credentials from an administrator.
              </p>
            )}
          </div>

          {/* Alternative Login Info (Page mode only) */}
          {isPageMode && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Contact your system administrator
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;