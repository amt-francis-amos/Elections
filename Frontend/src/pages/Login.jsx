import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = ({
  isOpen,
  onClose,
  onLoginSuccess,
  navigate,
  router,
  redirectMethod = "navigate",
}) => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [retryAfter, setRetryAfter] = useState(null);
  const [lastAttemptTime, setLastAttemptTime] = useState(null);

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
      redirectTo("/admin");
    } else if (user.role === "voter") {
      showNotification("Welcome, Voter! Redirecting...", "success");
      redirectTo("/vote");
    } else {
      showNotification("Unknown role. Redirecting to home.", "warning");
      redirectTo("/");
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

  // Add delay between requests to prevent rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkRateLimit = () => {
    const now = Date.now();
    const minTimeBetweenRequests = 2000; // 2 seconds minimum between requests
    
    if (lastAttemptTime && (now - lastAttemptTime) < minTimeBetweenRequests) {
      const waitTime = Math.ceil((minTimeBetweenRequests - (now - lastAttemptTime)) / 1000);
      showNotification(`Please wait ${waitTime} seconds before trying again`, "warning");
      return false;
    }
    
    if (retryAfter && now < retryAfter) {
      const waitTime = Math.ceil((retryAfter - now) / 1000);
      showNotification(`Rate limited. Please wait ${waitTime} seconds`, "warning");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Check client-side rate limiting
    if (!checkRateLimit()) return;

    setLoading(true);
    setLastAttemptTime(Date.now());
    
    const loginUrl = "https://elections-backend-j8m8.onrender.com/api/users/login";

    try {
      const payload = {
        id: formData.id.trim(),
        password: formData.password
      };

      console.log('Attempting login with payload:', { id: payload.id, password: '[REDACTED]' });

      // Add a small delay to avoid rapid requests
      await delay(500);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Debug logging
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Content-Type:', response.headers.get('content-type'));

      // Check for rate limit headers
      const retryAfterHeader = response.headers.get('retry-after');
      if (retryAfterHeader) {
        const retryAfterMs = parseInt(retryAfterHeader) * 1000;
        setRetryAfter(Date.now() + retryAfterMs);
      }

      // Get response as text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if the response is empty
      if (!responseText) {
        throw new Error('Server returned empty response');
      }

      // Check if response looks like JSON
      let data;
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Response text that failed to parse:', responseText);
          throw new Error('Server returned malformed JSON response');
        }
      } else {
        // Response is not JSON - likely an HTML error page or plain text error
        console.error('Non-JSON response received:', responseText);
        
        // Check for common error patterns
        if (responseText.toLowerCase().includes('too many requests')) {
          // Set a retry time if not provided by server
          if (!retryAfterHeader) {
            setRetryAfter(Date.now() + 60000); // Wait 1 minute
          }
          throw new Error('Too many login attempts. Please wait before trying again.');
        } else if (responseText.toLowerCase().includes('rate limit')) {
          setRetryAfter(Date.now() + 60000); // Wait 1 minute
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        } else if (responseText.toLowerCase().includes('not found')) {
          throw new Error('Login service not available. Please try again later.');
        } else if (responseText.toLowerCase().includes('internal server error')) {
          throw new Error('Server error. Please try again later.');
        } else if (responseText.includes('<!DOCTYPE html>')) {
          throw new Error('Server returned an error page. Please check if the backend is running.');
        } else {
          throw new Error(`Server error: ${responseText.substring(0, 100)}...`);
        }
      }

      // Check response status
      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 429) {
          setRetryAfter(Date.now() + 60000); // Wait 1 minute for 429 errors
          throw new Error('Too many requests. Please wait before trying again.');
        }
        
        // If we have parsed JSON data with an error message, use it
        if (data && data.message) {
          throw new Error(data.message);
        } else {
          throw new Error(`Login failed with status ${response.status}: ${response.statusText}`);
        }
      }

      // Validate response structure
      if (!data) {
        throw new Error('No data received from server');
      }

      console.log('Parsed response data:', data);

      const { token, user } = data;

      if (!token || !user) {
        console.error('Invalid response structure:', data);
        throw new Error("Invalid login response - missing token or user data");
      }

      // Validate user object
      if (!user._id || !user.name || !user.email || !user.userId || !user.role) {
        console.error('Incomplete user data:', user);
        throw new Error("Invalid user data received from server");
      }

      console.log('Login successful for user:', { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        userId: user.userId 
      });

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      showNotification("Login successful!", "success");

      // Reset rate limiting on successful login
      setRetryAfter(null);
      setLastAttemptTime(null);

      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess({ user, token });
      }

      // Close modal and reset form
      onClose();
      setFormData({ id: "", password: "" });

      // Handle role-based redirect
      setTimeout(() => {
        handleRoleBasedRedirect(user);
      }, 1000); // Small delay to let user see success message

    } catch (err) {
      console.error('Login error:', err);
      
      // Network or fetch errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showNotification('Network error. Please check your internet connection.', 'error');
      } else if (err.name === 'AbortError') {
        showNotification('Request timed out. Please try again.', 'error');
      } else {
        // Use the error message we constructed above
        const msg = err.message || "Something went wrong during login";
        showNotification(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Calculate remaining wait time for display
  const getRemainingWaitTime = () => {
    if (!retryAfter) return 0;
    const remaining = Math.max(0, Math.ceil((retryAfter - Date.now()) / 1000));
    return remaining;
  };

  const remainingWaitTime = getRemainingWaitTime();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="Close login modal"
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Election System Login
          </h2>

          {/* Rate Limit Warning */}
          {remainingWaitTime > 0 && (
            <div className="mb-4 p-3 rounded-md text-sm bg-orange-100 text-orange-700 border border-orange-300">
              Rate limited. Please wait {remainingWaitTime} seconds before trying again.
            </div>
          )}

          {/* Notification */}
          {notification.message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              notification.type === "error" ? "bg-red-100 text-red-700 border border-red-300" :
              notification.type === "success" ? "bg-green-100 text-green-700 border border-green-300" :
              notification.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
              "bg-blue-100 text-blue-700 border border-blue-300"
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Input */}
            <div className="relative">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder=" "
                required
                disabled={loading || remainingWaitTime > 0}
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                User ID
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                disabled={loading || remainingWaitTime > 0}
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                Password
              </label>
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || remainingWaitTime > 0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || remainingWaitTime > 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : remainingWaitTime > 0 ? (
                `Wait ${remainingWaitTime}s`
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Note:</strong> Only registered users can login.
              Voters must receive their credentials from an administrator.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;