
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("https://elections-backend-j8m8.onrender.com/api/register", formData); 
      const { token, user } = response.data;
      setMessage("Login successful!");
      localStorage.setItem("token", token);
      console.log("User:", user);
   
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-600">Login to Your Account</h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
        <p className="text-center text-xs text-gray-500 mt-6">Don't have an account? Register now</p>
      </div>
    </div>
  );
};

export default Login;
