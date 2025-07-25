import { useState } from "react";
import axios from "axios";

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = isLogin
        ? "https://elections-backend-j8m8.onrender.com/api/login"
        : "https://elections-backend-j8m8.onrender.com/api/register";

      const response = await axios.post(url, formData);
      const { token, user } = response.data;

      setMessage(`${isLogin ? "Login" : "Registration"} successful!`);
      localStorage.setItem("token", token);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (error) {
      setMessage(error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-600">
          {isLogin ? "Login to Your Account" : "Create an Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
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
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("successful") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-indigo-600 mt-6 cursor-pointer"
        >
          {isLogin
            ? "Don't have an account? Register now"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;
