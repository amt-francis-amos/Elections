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
  const [lastAttempt, setLastAttempt] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  useState(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

 
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const makeRequestWithRetry = async (url, options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        
       
        if (responseText.toLowerCase().includes('too many requests')) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; 
            console.log(`Rate limited. Retrying in ${waitTime/1000} seconds... (Attempt ${attempt}/${maxRetries})`);
            showNotification(`Rate limited. Retrying in ${waitTime/1000} seconds...`, 'warning');
            await sleep(waitTime);
            continue;
          } else {
            throw new Error('Rate limit exceeded. Please wait 10-15 minutes before trying again.');
          }
        }
        
        return { response, responseText };
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
    
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Request failed. Retrying in ${waitTime/1000} seconds... (Attempt ${attempt}/${maxRetries})`);
        await sleep(waitTime);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

   
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttempt;
    const minInterval = 5000; 

    if (timeSinceLastAttempt < minInterval) {
      const remainingCooldown = Math.ceil((minInterval - timeSinceLastAttempt) / 1000);
      setCooldownTime(remainingCooldown);
      showNotification(`Please wait ${remainingCooldown} seconds before trying again`, 'warning');
      return;
    }

    setLoading(true);
    setLastAttempt(now);
    const loginUrl = "https://elections-backend-j8m8.onrender.com/api/users/login";

    try {
      const payload = {
        id: formData.id.trim(),
        password: formData.password
      };

      console.log('Attempting login with payload:', { id: payload.id, password: '[REDACTED]' });

   
      const { response, responseText } = await makeRequestWithRetry(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

     
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Raw response:', responseText);

      
      if (!responseText) {
        throw new Error('Server returned empty response');
      }

   
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
      
        console.error('Non-JSON response received:', responseText);
        
        
        if (responseText.toLowerCase().includes('too many requests')) {
          throw new Error('Rate limit exceeded. Please wait 10-15 minutes before trying again.');
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

     
      if (!response.ok) {
     
        if (data && data.message) {
          throw new Error(data.message);
        } else {
          throw new Error(`Login failed with status ${response.status}: ${response.statusText}`);
        }
      }

    
      if (!data) {
        throw new Error('No data received from server');
      }

      console.log('Parsed response data:', data);

      const { token, user } = data;

      if (!token || !user) {
        console.error('Invalid response structure:', data);
        throw new Error("Invalid login response - missing token or user data");
      }

      
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

     
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      showNotification("Login successful!", "success");

     
      if (onLoginSuccess) {
        onLoginSuccess({ user, token });
      }

  
      onClose();
      setFormData({ id: "", password: "" });

      
      setTimeout(() => {
        handleRoleBasedRedirect(user);
      }, 1000); 

    } catch (err) {
      console.error('Login error:', err);
      
    
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showNotification('Network error. Please check your internet connection.', 'error');
      } else if (err.name === 'AbortError') {
        showNotification('Request timed out. Please try again.', 'error');
      } else {
    
        const msg = err.message || "Something went wrong during login";
        showNotification(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

 
  if (!isOpen) return null;

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
          
            <div className="relative">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder=" "
                required
                disabled={loading}
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                User ID
              </label>
            </div>

          
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                disabled={loading}
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                Password
              </label>
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-50"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

        
            <button
              type="submit"
              disabled={loading || cooldownTime > 0}
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
              ) : cooldownTime > 0 ? (
                `Wait ${cooldownTime}s`
              ) : (
                "Login"
              )}
            </button>
          </form>

       
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