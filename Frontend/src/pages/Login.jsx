import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginUrl =
      "https://elections-backend-j8m8.onrender.com/api/users/login";
    const registerUrl =
      "https://elections-backend-j8m8.onrender.com/api/users/register";

    try {
      const url = isLogin ? loginUrl : registerUrl;
      const payload = isLogin
        ? {
            id: formData.id,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const response = await axios.post(url, payload);
      const data = response.data;

      if (isLogin) {
        const { token, user } = data;
        if (!token || !user) throw new Error("Invalid login response");

        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(user));

        toast.success("Login successful!");
        if (user.role === "admin") {
          toast.success("Welcome, Admin!");
        } else {
          toast.info("Welcome, Voter!");
        }

        if (onLoginSuccess) onLoginSuccess(user);
        onClose();
      } else {
        const { user, token } = data;
        if (!user || !user.userId || !token) {
          throw new Error("Invalid registration response format");
        }

        toast.success(`Registration successful! Your ID is: ${user.userId}`);
        setFormData({
          id: user.userId,
          email: user.email,
          password: formData.password,
          name: "",
        });

        setTimeout(() => setIsLogin(true), 1000);
      }
    } catch (error) {
      console.error("Request error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
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
                    className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
                    Name
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
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
                  required
                  onChange={handleChange}
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
                required
                onChange={handleChange}
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
            onClick={() => setIsLogin(!isLogin)}
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
