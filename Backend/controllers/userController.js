import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ onLoginSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    id: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginUrl = "https://elections-backend-j8m8.onrender.com/api/users/login";
    const registerUrl = "https://elections-backend-j8m8.onrender.com/api/users/register";

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
          throw new Error("Invalid registration response");
        }

        toast.success(`Registration successful! Your ID is: ${user.userId}`);

        // Switch to login and auto-fill user ID & password
        setFormData({
          id: user.userId,
          password: formData.password,
          name: "",
          email: "",
        });

        setTimeout(() => setIsLogin(true), 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-md shadow-md">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
                Full Name
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
            type="password"
            name="password"
            value={formData.password}
            required
            onChange={handleChange}
            className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-indigo-500 transition-all">
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin((prev) => !prev)}
          className="text-indigo-600 hover:underline"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default Login;
