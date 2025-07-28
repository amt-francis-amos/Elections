
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({
  isOpen,
  onClose,
  onLoginSuccess,
  navigate,
  router,
  redirectMethod = "navigate",
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        toast.error("Name must be at least 2 characters long");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Please provide a valid email address");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  const handleRoleBasedRedirect = (user) => {
    if (user.role === "admin") {
      toast.success("Welcome, Admin! Redirecting...");
      redirectTo("/admin");
    } else if (user.role === "voter") {
      toast.info("Welcome, Voter! Redirecting...");
      redirectTo("/vote");
    } else {
      toast.warn("Unknown role. Redirecting to home.");
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
    const registerUrl = "https://elections-backend-j8m8.onrender.com/api/users/register";

    try {
      const url = isLogin ? loginUrl : registerUrl;
      const payload = isLogin
        ? { id: formData.id.trim(), password: formData.password }
        : {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          };

      const { data } = await axios.post(url, payload);

      if (isLogin) {
        const { token, user } = data;
        if (!token || !user) throw new Error("Invalid login response");

      
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(user));

        toast.success("Login successful!");
        if (onLoginSuccess) onLoginSuccess({ user, token });
        onClose();
        setFormData({ id: "", name: "", email: "", password: "" });
        handleRoleBasedRedirect(user);
      } else {
        const { user: newUser, token: newToken } = data;
        if (!newUser || !newUser.userId || !newToken)
          throw new Error("Invalid registration response");

        toast.success(`Registration successful! Your ID is: ${newUser.userId}`);
        setFormData({
          id: newUser.userId,
          password: formData.password,
          name: "",
          email: "",
        });
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg);
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
                    onChange={handleChange}
                    placeholder=" "
                    required
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
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                    Email Address
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
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                  User ID
                </label>
              </div>
            )}

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
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
