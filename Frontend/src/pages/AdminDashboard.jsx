import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle,
  Eye,
  Plus,
  Settings,
  Bell,
  Edit,
  Trash2,
  Download,
  UserPlus,
  UserMinus,
  Search,
  X,
  Save,
  PieChart,
  Users2,
  MapPin,
  Mail,
  Phone,
  Upload,
  Camera,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
    totalUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [notification, setNotification] = useState(null);


  useEffect(() => {
    
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

 
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadVoters(),
      ]);
      
   
      updateStats();
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadVoters = async () => {
    try {
      const response = await axios.get('https://elections-backend-j8m8.onrender.com/api/admin/voters');
      
      if (response.data.success) {
        setVoters(response.data.voters);
        setUsers(response.data.voters); 
        
        
        addToRecentActivity('system', 'Voters data refreshed', 'info');
      }
    } catch (error) {
      console.error('Failed to load voters:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load voters';
      showNotification(errorMessage, 'error');
    }
  };

  const updateStats = () => {
    setStats({
      totalElections: elections.length,
      activeElections: elections.filter(e => e.status === 'active').length,
      totalCandidates: candidates.length,
      totalVotes: elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0),
      totalUsers: voters.length
    });
  };

  const addToRecentActivity = (type, action, status = 'success') => {
    const newActivity = {
      id: Date.now(),
      type,
      action,
      time: 'Just now',
      status
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
  };


  const handleCreateVoter = async () => {
    try {
      setLoading(true);
      
      const requestData = {
        name: formData.name,
        ...(formData.email && { email: formData.email })
      };

      const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/admin/create-voter', requestData);

      if (response.data.success) {
        const { credentials } = response.data;
        showNotification(
          `Voter created successfully! Credentials: ID: ${credentials.userId}, Password: ${credentials.password}`, 
          'success'
        );
        addToRecentActivity('user', `New voter account created for ${formData.name}`, 'success');
        await loadVoters();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to create voter:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create voter';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/admin/promote', { userId });

      if (response.data.success) {
        showNotification('User promoted to admin successfully', 'success');
        addToRecentActivity('user', `User promoted to admin`, 'info');
        await loadVoters();
      }
    } catch (error) {
      console.error('Failed to promote user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to promote user';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const user = users.find(u => u._id === userId);
      
      const response = await axios.delete(`https://elections-backend-j8m8.onrender.com/api/admin/users/${userId}`);

      if (response.data.success) {
        showNotification('User deleted successfully', 'success');
        addToRecentActivity('user', `User ${user?.name} account deleted`, 'completed');
        await loadVoters(); 
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateElection = async () => {
    try {
      setLoading(true);
      
    
      const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/admin/elections', formData);
      
      if (response.data.success) {
        showNotification('Election created successfully', 'success');
        addToRecentActivity('election', `New election "${formData.title}" created`, 'success');
       
        closeModal();
      }
    } catch (error) {
      console.error('Failed to create election:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create election';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateElection = async () => {
    try {
      setLoading(true);
      
     
      const response = await axios.put(`https://elections-backend-j8m8.onrender.com/api/admin/elections/${selectedElection._id}`, formData);
      
      if (response.data.success) {
        showNotification('Election updated successfully', 'success');
        addToRecentActivity('election', `Election "${formData.title}" updated`, 'info');
       
        closeModal();
      }
    } catch (error) {
      console.error('Failed to update election:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update election';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election?')) {
      return;
    }

    try {
      setLoading(true);
      

      const response = await axios.delete(`https://elections-backend-j8m8.onrender.com/api/admin/elections/${electionId}`);
      
      if (response.data.success) {
        showNotification('Election deleted successfully', 'success');
        addToRecentActivity('election', 'Election deleted', 'completed');
        
      }
    } catch (error) {
      console.error('Failed to delete election:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete election';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleAddCandidate = async () => {
    try {
      setLoading(true);
      
  
      const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/admin/candidates', formData);
      
      if (response.data.success) {
        showNotification('Candidate added successfully', 'success');
        addToRecentActivity('candidate', `${formData.name} registered for ${formData.position} position`, 'success');

        closeModal();
      }
    } catch (error) {
      console.error('Failed to add candidate:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add candidate';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateImageUpload = async (candidateId, file) => {
    try {
      setImageUploadLoading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('candidateId', candidateId);


      const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/admin/candidates/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showNotification('Image uploaded successfully', 'success');
        addToRecentActivity('candidate', 'Photo uploaded for candidate', 'success');
       
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      showNotification(errorMessage, 'error');
    } finally {
      setImageUploadLoading(false);
    }
  };


  const exportResults = async (format, electionId = null) => {
    try {
      setLoading(true);
      
      
      const response = await axios.get('https://elections-backend-j8m8.onrender.com/api/admin/export', {
        params: { format, electionId },
        responseType: 'blob'
      });

    
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showNotification(`Results exported in ${format.toUpperCase()} format`, 'success');
      addToRecentActivity('election', `Results exported in ${format.toUpperCase()} format`, 'info');
    } catch (error) {
      console.error('Failed to export results:', error);
      const errorMessage = error.response?.data?.message || 'Failed to export results';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, data = null) => {
    setShowModal(type);
    if (data) {
      setFormData(data);
      if (type === 'editUser') setSelectedUser(data);
      if (type === 'editElection') setSelectedElection(data);
      if (type === 'editCandidate') setSelectedCandidate(data);
    } else {
      setFormData({});
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedUser(null);
    setSelectedElection(null);
    setSelectedCandidate(null);
    setFormData({});
  };


  const getActivityIcon = (type) => {
    switch (type) {
      case 'election': return <Calendar size={16} />;
      case 'candidate': return <Trophy size={16} />;
      case 'vote': return <BarChart3 size={16} />;
      case 'user': return <Users size={16} />;
      case 'system': return <Activity size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const quickActions = [
    { 
      icon: UserPlus, 
      label: 'Create Voter Account', 
      color: 'bg-purple-500 hover:bg-purple-600', 
      action: () => openModal('createVoter') 
    },
    { 
      icon: RefreshCw, 
      label: 'Refresh Data', 
      color: 'bg-blue-500 hover:bg-blue-600', 
      action: loadDashboardData 
    },
    { 
      icon: Download, 
      label: 'Export Data', 
      color: 'bg-green-500 hover:bg-green-600', 
      action: () => exportResults('csv') 
    },
    { 
      icon: BarChart3, 
      label: 'View Reports', 
      color: 'bg-orange-500 hover:bg-orange-600', 
      action: () => setActiveTab('reports') 
    }
  ];


  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}


      {imageUploadLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Uploading image...</span>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg max-w-md ${
              notification.type === 'error' 
                ? 'bg-red-100 border border-red-300 text-red-800' 
                : notification.type === 'info'
                ? 'bg-blue-100 border border-blue-300 text-blue-800'
                : 'bg-green-100 border border-green-300 text-green-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {notification.type === 'error' ? (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        </div>
      )}


      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage elections, candidates, and users.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                {recentActivity.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
          

          <div className="mt-6 border-t pt-4">
            <nav className="flex space-x-8">
              {['dashboard', 'users', 'elections', 'candidates', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Elections</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalElections}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Trophy size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Votes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} text-white p-4 rounded-lg flex items-center gap-3 transition-colors duration-200`}
                  >
                    <action.icon size={20} />
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => openModal('createVoter')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Create Voter
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={loadVoters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

      
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {user.userId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handlePromoteToAdmin(user._id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Promote to Admin"
                              >
                                <UserPlus size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No users found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

     
        {activeTab === 'elections' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Elections Management</h3>
            <p className="text-gray-500">Elections management features will be implemented when you have election endpoints.</p>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidates Management</h3>
            <p className="text-gray-500">Candidates management features will be implemented when you have candidate endpoints.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-500">Reports and analytics features will be implemented when you have more data endpoints.</p>
          </div>
        )}
      </div>

 
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {showModal === 'createVoter' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Create Voter Account</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter voter's full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="voter@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If not provided, a system email will be generated
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
                      onClick={handleCreateVoter}
                      disabled={!formData.name || formData.name.trim().length < 2}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserPlus size={16} />
                      Create Voter
                    </button>
                  </div>
                </div>
              )}

              {(showModal === 'createElection' || showModal === 'editElection') && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showModal === 'createElection' ? 'Create New Election' : 'Edit Election'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter election title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter election description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate || ''}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={formData.endDate || ''}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Voters</label>
                      <input
                        type="number"
                        value={formData.eligibleVoters || ''}
                        onChange={(e) => setFormData({...formData, eligibleVoters: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter number of eligible voters"
                      />
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
                      onClick={showModal === 'createElection' ? handleCreateElection : handleUpdateElection}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === 'createElection' ? 'Create Election' : 'Update Election'}
                    </button>
                  </div>
                </div>
              )}

              {(showModal === 'addCandidate' || showModal === 'editCandidate') && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showModal === 'addCandidate' ? 'Add New Candidate' : 'Edit Candidate'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter candidate's full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={formData.position || ''}
                          onChange={(e) => setFormData({...formData, position: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="President, Vice President, etc."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
                      <select
                        value={formData.electionId || ''}
                        onChange={(e) => setFormData({...formData, electionId: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an election</option>
                        {elections.map((election) => (
                          <option key={election.id} value={election.id}>
                            {election.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="candidate@university.edu"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={formData.department || ''}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+233 24 123 4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="text"
                          value={formData.year || ''}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1st Year, 2nd Year, etc."
                        />
                      </div>
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
                      onClick={showModal === 'addCandidate' ? handleAddCandidate : handleUpdateCandidate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === 'addCandidate' ? 'Add Candidate' : 'Update Candidate'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;