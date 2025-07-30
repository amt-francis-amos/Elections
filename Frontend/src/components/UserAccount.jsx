
import React from 'react';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  UserCheck
} from 'lucide-react';

const UserAccount = ({
  users,
  searchTerm,
  setSearchTerm,
  openModal,
  handleDeleteUser,
  handlePromoteUser
}) => {
  const filteredUsers = users.filter(user => {
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.userId?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (user) => {
    openModal('editUser', user);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      handleDeleteUser(userId);
    }
  };

  const handlePromote = (user) => {
    if (user.role === 'admin') {
      alert('User is already an admin');
      return;
    }
    if (window.confirm(`Are you sure you want to promote ${user.name} to admin?`)) {
      handlePromoteUser(user);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => openModal('createUser')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus size={20} />
          Create User Account
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, role, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user._id || user.id || `user-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                          <Users size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {user.userId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' && <Shield size={12} className="mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handlePromote(user)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Promote to admin"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id || user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;



const handleUpdateUser = async () => {
  try {
    if (!selectedUser) {
      alert("No user selected for update");
      return;
    }

    if (!formData.name || formData.name.trim().length < 2) {
      alert("Name must be at least 2 characters long");
      return;
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Please provide a valid email address");
        return;
      }

    
      const existingUser = users.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase().trim() && 
        (u._id !== selectedUser._id && u.id !== selectedUser._id)
      );
      if (existingUser) {
        alert("Email is already taken by another user");
        return;
      }
    }

    
    const existingName = users.find(u => 
      u.name.toLowerCase() === formData.name.toLowerCase().trim() && 
      (u._id !== selectedUser._id && u.id !== selectedUser._id)
    );
    if (existingName) {
      alert("Name is already taken by another user");
      return;
    }

    const userId = selectedUser._id || selectedUser.id;
    
    const payload = {
      name: formData.name.trim(),
      email: formData.email ? formData.email.toLowerCase().trim() : selectedUser.email,
      role: formData.role || selectedUser.role
    };

    console.log("Updating user with payload:", payload);

    const { data } = await axios.put(
      `${API_BASE_URL}/admin/users/${userId}`,
      payload
    );

    console.log("User updated successfully:", data);

    
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        const currentId = user._id || user.id;
        if (currentId === userId) {
          return {
            ...user,
            ...data.user,
            id: user.id || user._id, 
          };
        }
        return user;
      })
    );

    setRecentActivity((prevActivity) => [
      { 
        id: Date.now(), 
        type: "user", 
        action: `User "${data.user.name}" updated`, 
        time: "Just now", 
        status: "info" 
      },
      ...prevActivity.slice(0, 4),
    ]);

    closeModal();
    alert("User updated successfully!");

  } catch (err) {
    console.error("Error updating user:", err);
    
    if (err.response?.data?.message) {
      alert(`Error: ${err.response.data.message}`);
    } else {
      alert(`Error updating user: ${err.message}`);
    }
  }
};

// Update the existing handleDeleteUser function
const handleDeleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return;
  }

  try {
    const user = users.find((u) => u._id === id || u.id === id);
    const userId = user?._id || user?.id || id;

    console.log("Deleting user with ID:", userId);

    await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);

    setUsers((prevUsers) => 
      prevUsers.filter((u) => u._id !== id && u.id !== id && u._id !== userId && u.id !== userId)
    );

    setStats(prevStats => ({
      ...prevStats,
      totalUsers: Math.max(0, prevStats.totalUsers - 1),
    }));

    setRecentActivity((prevActivity) => [
      { 
        id: Date.now(), 
        type: "user", 
        action: `User "${user?.name || 'Unknown'}" deleted`, 
        time: "Just now", 
        status: "completed" 
      },
      ...prevActivity.slice(0, 4),
    ]);

    alert("User deleted successfully!");

  } catch (err) {
    console.error("Error deleting user:", err);
    
    if (err.response?.data?.message) {
      alert(`Error: ${err.response.data.message}`);
    } else {
      alert(`Error deleting user: ${err.message}`);
    }
  }
};

// Update the existing handlePromoteUser function
const handlePromoteUser = async (user) => {
  try {
    if (user.role === 'admin') {
      alert("User is already an admin");
      return;
    }

    const { data } = await axios.post(
      `${API_BASE_URL}/admin/promote`,
      { userId: user._id || user.id }
    );

    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        const currentId = u._id || u.id;
        const updatedId = data.user._id || data.user.id;
        if (currentId === updatedId) {
          return { ...u, ...data.user };
        }
        return u;
      })
    );

    setRecentActivity((prevActivity) => [
      { 
        id: Date.now(), 
        type: "user", 
        action: `User ${data.user.name} promoted to admin`, 
        time: "Just now", 
        status: "success" 
      },
      ...prevActivity.slice(0, 4),
    ]);

    alert(`${data.user.name} has been promoted to admin!`);

  } catch (err) {
    console.error("Error promoting user:", err);
    alert(`Error promoting user: ${err.response?.data?.message || err.message}`);
  }
};


{showModal === "editUser" && (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
      <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter user's full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter email address"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={formData.role || ""}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="voter">Voter</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>User ID:</strong> {selectedUser?.userId || 'N/A'}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Created:</strong> {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
    <div className="flex justify-end gap-3 mt-6">
      <button 
        onClick={closeModal} 
        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={handleUpdateUser}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Save size={16} />
        Update User
      </button>
    </div>
  </div>
)}


{activeTab === "users" && (
  <UserAccount
    users={users}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    openModal={openModal}
    handleDeleteUser={handleDeleteUser}
    handlePromoteUser={handlePromoteUser}
  />
)}


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long"
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

     
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already taken by another user"
        });
      }
    }

   
    const existingName = await User.findOne({ 
      name: name.trim(),
      _id: { $ne: id }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Name already taken by another user"
      });
    }


    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user._id.toString() === req.user._id.toString() && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }


    user.name = name.trim();
    if (email && email.trim()) {
      user.email = email.toLowerCase().trim();
    }
    if (role && ['voter', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    console.log(`✅ User updated by admin ${req.user.name}:`, user.name);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message
    });
  }
};