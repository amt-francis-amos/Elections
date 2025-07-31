import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

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

      const response = await axios.post(loginUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, 
      });

      const { token, user } = response.data;
      
      if (!token || !user) throw new Error("Invalid login response");

      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      showNotification("Login successful!", "success");
      if (onLoginSuccess) onLoginSuccess({ user, token });
      onClose();
      setFormData({ id: "", password: "" });
      handleRoleBasedRedirect(user);
      
    } catch (err) {
      let msg = "Something went wrong";
      
      if (err.response) {
       
        msg = err.response.data?.message || `Error: ${err.response.status}`;
      } else if (err.request) {
      
        msg = "Network error. Please check your connection.";
      } else if (err.code === 'ECONNABORTED') {
    
        msg = "Request timeout. Please try again.";
      } else {
        msg = err.message || "Something went wrong";
      }
      
      showNotification(msg, "error");
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
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
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

          <div onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                Password
              </label>
              <div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

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