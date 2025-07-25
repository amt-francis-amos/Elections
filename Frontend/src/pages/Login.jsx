import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiX
} from "react-icons/fi";

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const rateLimitExpiry = localStorage.getItem('rateLimitExpiry');
    if (rateLimitExpiry && Date.now() > parseInt(rateLimitExpiry)) {
      localStorage.removeItem('rateLimitExpiry');
      setIsRateLimited(false);
    }
  }, []);

  const handleClose = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setIsLogin(true);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

  
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!isLogin && !formData.name.trim()) newErrors.name = "Name is required";
    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (isRateLimited) {
        toast.error("Too many attempts. Please try again later.");
        return;
      }

      if (isLogin) {
        const res = await axios.post("https://elections-backend-j8m8.onrender.com/api/users/login", {
          email: formData.email.trim(),
          password: formData.password
        }, {
          timeout: 10000
        });

        toast.success("Login successful!");

        const userData = {
          name: res.data.user?.name || formData.email.split('@')[0] || 'User',
          email: res.data.user?.email || formData.email,
          profilePicture: res.data.user?.profilePicture || null,
          token: res.data.token
        };

        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));

      
        localStorage.removeItem('userToken');

        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(userData);
        }

        handleClose();
        setTimeout(() => navigate('/'), 100);

      } else {
        await axios.post("https://elections-backend-j8m8.onrender.com/api/users/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        }, {
          timeout: 10000
        });

        toast.success("Registration successful. Please login.");
        setIsLogin(true);
      }

    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many attempts. Try again in 10 minutes.");
        setIsRateLimited(true);
        localStorage.setItem('rateLimitExpiry', Date.now() + 10 * 60 * 1000); 
      } else {
        toast.error(err.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "" : "hidden"}`}>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block mb-1">Name</label>
              <div className="flex items-center border rounded px-3">
                <FiUser className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-2 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <div className="flex items-center border rounded px-3">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <div className="flex items-center border rounded px-3">
              <FiLock className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label className="block mb-1">Confirm Password</label>
              <div className="flex items-center border rounded px-3">
                <FiLock className="text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full p-2 outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline ml-1">
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
