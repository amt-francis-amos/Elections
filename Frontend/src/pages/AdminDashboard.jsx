import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://elections-backend-j8m8.onrender.com/api/admin',
  withCredentials: true,
});

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await API.get('https://elections-backend-j8m8.onrender.com/api/voters');
        if (res.data.success) {
          setUsers(res.data.voters);
        }
      } catch (error) {
        console.error('Error fetching voters:', error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, []);

  const openModal = () => {
    setModalOpen(true);
    setFormData({ name: '', email: '' });
  };

  const closeModal = () => setModalOpen(false);

  const handleCreateUser = async () => {
    try {
      const res = await API.post('https://elections-backend-j8m8.onrender.com/api/create-voter', {
        name: formData.name,
        email: formData.email,
      });

      if (res.data.success) {
        setUsers(prev => [res.data.voter, ...prev]);

        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'user',
            action: `New voter account created: ${res.data.voter.name}`,
            time: 'Just now',
            status: 'success',
          },
          ...prev.slice(0, 4),
        ]);

        closeModal();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create voter');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/users/${id}`);
        const deletedUser = users.find(u => u._id === id);
        setUsers(users.filter(u => u._id !== id));

        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'user',
            action: `User ${deletedUser?.name} account deleted`,
            time: 'Just now',
            status: 'completed',
          },
          ...prev.slice(0, 4),
        ]);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const promoteUserToAdmin = async (userId) => {
    try {
      const res = await API.post('/promote', { userId });
      if (res.data.success) {
        alert('User promoted to admin');
        setUsers(users.map(u => (u._id === userId ? { ...u, role: 'admin' } : u)));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to promote user');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={openModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Voter
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Voter</h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCreateUser}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* User List */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Voters</h2>
          {loading ? (
            <p>Loading voters...</p>
          ) : (
            <ul className="space-y-3">
              {users.map(user => (
                <li key={user._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-blue-500">{user.role}</p>
                  </div>
                  <div className="space-x-2">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => promoteUserToAdmin(user._id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Promote
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

       
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {recentActivity.map(activity => (
              <li key={activity.id} className="text-sm border-b pb-2">
                <p className="font-medium">{activity.action}</p>
                <p className="text-gray-500">{activity.time}</p>
                <p className={`text-xs ${activity.status === 'success' ? 'text-green-500' : 'text-gray-400'}`}>
                  {activity.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
