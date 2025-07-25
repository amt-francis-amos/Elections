import React, { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../components/UserTable";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  // Create axios instance with dynamic token
  const createApiInstance = () => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "https://elections-backend-j8m8.onrender.com/api",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const fetchUsers = async () => {
    try {
      const api = createApiInstance();
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load users.");
    }
  };

  const promoteHandler = async (userId) => {
    try {
      const api = createApiInstance();
      const res = await api.post("/admin/promote", { userId });
      setMessage(res.data.message);
      fetchUsers(); // Refresh users
    } catch (err) {
      console.error(err.response?.data?.message);
      setMessage(err.response?.data?.message || "Promotion failed.");
    }
  };

  const deleteHandler = async (userId) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      const api = createApiInstance();
      const res = await api.delete(`/admin/users/${userId}`);
      setMessage(res.data.message);
      fetchUsers(); // Refresh users
    } catch (err) {
      console.error(err.response?.data?.message);
      setMessage(err.response?.data?.message || "Delete failed.");
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

      <UserTable users={users} promoteHandler={promoteHandler} deleteHandler={deleteHandler} />
    </div>
  );
};

export default AdminDashboard;