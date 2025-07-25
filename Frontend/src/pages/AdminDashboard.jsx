
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../components/UserTable";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://elections-backend-j8m8.onrender.com/api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load users.");
      toast.error("Failed to load users.");
    }
  };

  const promoteHandler = async (userId) => {
    try {
      const res = await api.post("/admin/promote", { userId });
      setMessage(res.data.message);
      toast.success(res.data.message);
      fetchUsers(); // Refresh users
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      const errorMsg = err.response?.data?.message || "Promotion failed.";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>

      {message && (
        <div className="mb-4 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded">
          {message}
        </div>
      )}

      <UserTable users={users} promoteHandler={promoteHandler} />
    </div>
  );
};

export default AdminDashboard;
