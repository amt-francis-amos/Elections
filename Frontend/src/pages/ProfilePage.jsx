import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  UserCircle,
  LogOut,
  AlertCircle,
  Upload,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();


  const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");
    
    if (!token || !userData || userData === "undefined" || userData === "null") {
      navigate('/');
      setLoading(false);
      return;
    }
    
    try {
    
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({
        name: parsedUser.name || '',
        email: parsedUser.email || ''
      });
      
  
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const freshUserData = response.data.user;
        setUser(freshUserData);
        setEditForm({
          name: freshUserData.name || '',
          email: freshUserData.email || ''
        });
        
      
        localStorage.setItem("userData", JSON.stringify(freshUserData));
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
        toast.error('Session expired. Please log in again.');
        navigate('/');
        return;
      } else {
       
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser._id) {
            setUser(parsedUser);
            setEditForm({
              name: parsedUser.name || '',
              email: parsedUser.email || ''
            });
            toast.warn('Using offline data. Some features may be limited.');
          } else {
            throw new Error('Invalid cached data');
          }
        } catch (parseError) {
          console.error('Error parsing cached user data:', parseError);
          localStorage.removeItem("userData");
          localStorage.removeItem("userToken");
          toast.error('Invalid session data. Please log in again.');
          navigate('/');
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
     
      setEditForm({
        name: user.name || '',
        email: user.email || ''
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
    
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
   
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
    
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.onerror = () => {
        toast.error('Error reading file');
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setImageUploading(true);
    
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/');
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(
        `${API_BASE_URL}/users/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user || {
          ...user,
          profilePicture: response.data.profilePictureUrl
        };
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setImagePreview(null);
        toast.success('Profile picture updated successfully!');
     
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(response.data.message || 'Failed to upload image');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
        navigate('/');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid image file');
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    setImageUploading(true);
    
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/users/remove-profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user || {
          ...user,
          profilePicture: null
        };
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setImagePreview(null);
        toast.success('Profile picture removed successfully!');
      } else {
        toast.error(response.data.message || 'Failed to remove image');
      }
      
    } catch (error) {
      console.error('Error removing image:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
        navigate('/');
      } else {
        toast.error('Failed to remove image. Please try again.');
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editForm.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error('Please provide a valid email address');
      return;
    }

    setUpdateLoading(true);
    
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        {
          name: editForm.name.trim(),
          email: editForm.email.toLowerCase().trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
        navigate('/');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid input data');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (token) {
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12">
              <div className="relative mb-4 sm:mb-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                    {getInitials(user.name)}
                  </div>
                )}
                
          
                <div className="absolute bottom-0 right-0 flex flex-col space-y-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                  >
                    <Camera size={16} />
                  </button>
                  
                  {(user.profilePicture || imagePreview) && (
                    <button
                      onClick={imagePreview ? () => setImagePreview(null) : handleRemoveProfilePicture}
                      disabled={imageUploading}
                      className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition shadow-lg disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1 min-w-0 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {user.name}
                    </h1>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    
                    {imagePreview && (
                      <button
                        onClick={handleImageUpload}
                        disabled={imageUploading}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {imageUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Upload size={16} />
                        )}
                        Upload Picture
                      </button>
                    )}
                    
                    {!isEditing ? (
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={updateLoading}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {updateLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </button>
                        <button
                          onClick={handleEditToggle}
                          disabled={updateLoading}
                          className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User size={18} className="text-gray-400" />
                      <span className="text-gray-900">{user.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserCircle size={18} className="text-gray-400" />
                    <span className="text-gray-900 font-mono">{user.userId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield size={18} className="text-gray-400" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Voter'}
                    </span>
                  </div>
                </div>

                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar size={18} className="text-gray-400" />
                      <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

         
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/vote')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <UserCircle size={16} />
                  </div>
                  <span className="font-medium">Go to Voting</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                  >
                    <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                    <span className="font-medium">Admin Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="font-medium">Home</span>
                </button>
              </div>
            </div>

        
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
              >
                <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                  <LogOut size={16} />
                </div>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;