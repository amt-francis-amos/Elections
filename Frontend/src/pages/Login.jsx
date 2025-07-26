import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  // Optional routing props - use whichever matches your setup
  navigate, // For React Router v6: const navigate = useNavigate()
  router,   // For Next.js: const router = useRouter()
  redirectMethod = "location" // "location" | "navigate" | "router"
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.id.trim()) {
        toast.error("User ID is required");
        return false;
      }
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
    } else {
      // Registration validation
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return false;
      }
      if (formData.name.trim().length < 2) {
        toast.error("Name must be at least 2 characters long");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please provide a valid email address");
        return false;
      }
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  // Role-based redirect function
  const handleRoleBasedRedirect = (user) => {
    const adminPath = "/admin-dashboard";
    const voterPath = "/voter-dashboard";
    const targetPath = user.role === "admin" ? adminPath : voterPath;

    const performRedirect = () => {
      switch (redirectMethod) {
        case "navigate": // React Router v6
          if (navigate) {
            navigate(targetPath);
          } else {
            console.warn("navigate function not provided, falling back to window.location");
            window.location.href = targetPath;
          }
          break;
          
        case "router": // Next.js
          if (router) {
            router.push(targetPath);
          } else {
            console.warn("router object not provided, falling back to window.location");
            window.location.href = targetPath;
          }
          break;
          
        case "location": // Plain redirect
        default:
          window.location.href = targetPath;
          break;
      }
    };

    // Perform redirect after toast message
    setTimeout(performRedirect, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    const loginUrl = "https://elections-backend-j8m8.onrender.com/api/users/login";
    const registerUrl = "https://elections-backend-j8m8.onrender.com/api/users/register";

    try {
      const url = isLogin ? loginUrl : registerUrl;
      const payload = isLogin
        ? {
            id: formData.id.trim(), 
            password: formData.password,
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          };

      console.log("Sending payload:", payload); 

      const response = await axios.post(url, payload);
      const data = response.data;

      if (isLogin) {
        const { token, user } = data;
        if (!token || !user) throw new Error("Invalid login response");

        // Store authentication data
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(user));
          
          // Debug: Log what we're storing
          console.log("Storing token:", token);
          console.log("Storing userData:", JSON.stringify(user));
          
          // Verify storage worked
          const storedToken = localStorage.getItem("token");
          const storedUserData = localStorage.getItem("userData");
          console.log("Verified stored token:", storedToken);
          console.log("Verified stored userData:", storedUserData);
          
        } catch (storageError) {
          console.error("localStorage error:", storageError);
          toast.error("Failed to save login data");
          return;
        }

        // Success message and role-based redirect
        toast.success("Login successful!");
        
        if (user.role === "admin") {
          toast.success("Welcome, Admin! Redirecting to Admin Dashboard...");
        } else {
          toast.info("Welcome, Voter! Redirecting to Voter Dashboard...");
        }

        // Call onLoginSuccess callback if provided
        if (onLoginSuccess) onLoginSuccess(user);
        
        // Close modal
        onClose();

        // Clear form data
        setFormData({ id: "", name: "", email: "", password: "" });

        // Handle role-based redirect
        handleRoleBasedRedirect(user);

      } else {
        // Handle registration response
        const { user, token } = data;
        if (!user || !user.userId || !token) {
          throw new Error("Invalid registration response format");
        }

        toast.success(`Registration successful! Your ID is: ${user.userId}`);
        
        // Auto-fill login form with new user's ID
        setFormData({
          id: user.userId,
          password: formData.password,
          name: "",
          email: "",
        });

        setTimeout(() => setIsLogin(true), 2000); 
      }
    } catch (error) {
      console.error("Request error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setFormData({ id: "", name: "", email: "", password: "" });
    setShowPassword(false);
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
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                    Name (min 2 characters)
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                    Email Address (use admin@election.com for admin role)
                  </label>
                </div>
              </>
            )}

            {isLogin && (
              <div className="relative">
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  required
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                  User ID (e.g., USR-ABC123)
                </label>
              </div>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                required
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                Password {!isLogin && "(min 6 characters)"}
              </label>
              <div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Registering..."
                : isLogin
                ? "Login"
                : "Register"}
            </button>
          </form>

          <p
            onClick={handleModeSwitch}
            className="text-center text-sm text-indigo-600 mt-6 cursor-pointer hover:text-indigo-800"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} pauseOnHover />
    </>
  );
};

export default Login;