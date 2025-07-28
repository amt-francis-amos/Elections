import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Copy,
  Check
} from 'lucide-react';

import Dashboard from '../components/Dashboard.jsx';
import Elections from '../components/Elections.jsx';
import Candidates from '../components/Candidates.jsx';
import Reports from '../components/Reports.jsx';
import UserAccount from '../components/UserAccount.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalElections: 12,
    activeElections: 3,
    totalCandidates: 45,
    totalVotes: 1250,
    totalUsers: 2100
  });
  
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'election',
      action: 'New election "Student Council 2025" created',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'candidate',
      action: 'John Doe registered for President position',
      time: '3 hours ago',
      status: 'info'
    },
    {
      id: 3,
      type: 'vote',
      action: 'Election "Class Representative" completed',
      time: '1 day ago',
      status: 'completed'
    }
  ]);

  const [elections, setElections] = useState([
    {
      id: 1,
      title: 'Student Council Elections 2025',
      description: 'Annual student council elections for leadership positions',
      status: 'active',
      startDate: '2025-07-20',
      endDate: '2025-07-30',
      totalVotes: 340,
      eligibleVoters: 500,
      totalCandidates: 8
    },
    {
      id: 2,
      title: 'Faculty Representative Elections',
      description: 'Choose faculty representatives for academic board',
      status: 'upcoming',
      startDate: '2025-08-01',
      endDate: '2025-08-05',
      totalVotes: 0,
      eligibleVoters: 150,
      totalCandidates: 6
    }
  ]);

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'President',
      electionTitle: 'Student Council Elections 2025',
      email: 'sarah.johnson@university.edu',
      phone: '+233 24 123 4567',
      department: 'Computer Science',
      year: '3rd Year',
      votes: 145,
      image: '/api/placeholder/64/64' 
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Vice President',
      electionTitle: 'Student Council Elections 2025',
      email: 'michael.chen@university.edu',
      phone: '+233 24 234 5678',
      department: 'Engineering',
      year: '4th Year',
      votes: 98,
      image: null
    }
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Alice Williams',
      email: 'alice.williams@university.edu',
      role: 'voter',
      department: 'Business',
      status: 'active'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@university.edu',
      role: 'admin',
      department: 'IT',
      status: 'active'
    }
  ]);
  
  // New states for voter management
  const [voters, setVoters] = useState([]);
  const [loadingVoters, setLoadingVoters] = useState(false);
  const [createdVoter, setCreatedVoter] = useState(null);
  const [voterFormData, setVoterFormData] = useState({
    name: '',
    email: ''
  });
  const [copiedField, setCopiedField] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Enhanced token retrieval with multiple fallbacks
  const getAuthToken = () => {
    // Try multiple sources for the token
    if (window.authData?.token) {
      return window.authData.token;
    }
    
    // Fallback to localStorage if available
    try {
      const stored = localStorage.getItem('authData');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token;
      }
    } catch (e) {
      console.log('No localStorage token found');
    }
    
    return null;
  };

  // Enhanced auth check
  const isAuthenticated = () => {
    const token = getAuthToken();
    const user = window.authData?.user;
    return token && user && user.role === 'admin';
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      showNotification(`${field} copied to clipboard!`, "success");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      showNotification("Failed to copy to clipboard", "error");
    }
  };

  // Handle voter form input changes
  const handleVoterChange = (e) => {
    setVoterFormData({ ...voterFormData, [e.target.name]: e.target.value });
  };

  // Enhanced create voter function with better error handling
  const handleCreateVoter = async (e) => {
    e.preventDefault();
    
    if (!voterFormData.name.trim()) {
      showNotification("Voter name is required", "error");
      return;
    }

    // Check authentication before making request
    if (!isAuthenticated()) {
      showNotification("You must be logged in as an admin to create voters", "error");
      return;
    }

    setLoading(true);
    const token = getAuthToken();

    console.log('Token being sent:', token ? 'Token exists' : 'No token');
    console.log('User data:', window.authData?.user);

    try {
      const requestBody = {
        name: voterFormData.name.trim(),
        email: voterFormData.email.trim() || undefined
      };

      console.log('Request body:', requestBody);

      const response = await fetch("https://elections-backend-j8m8.onrender.com/api/admin/create-voter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          showNotification("Session expired. Please login again.", "error");
          // Optionally redirect to login
          window.location.href = '/login';
          return;
        }
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setCreatedVoter(data);
      setVoterFormData({ name: "", email: "" });
      showNotification("Voter created successfully!", "success");
      fetchVoters(); // Refresh voters list

      // Update recent activity
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'user',
          action: `New voter "${data.voter.name}" created with ID: ${data.credentials.userId}`,
          time: 'Just now',
          status: 'success'
        },
        ...prev.slice(0, 4)
      ]);

    } catch (error) {
      console.error('Create voter error:', error);
      showNotification(error.message || "Failed to create voter", "error");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetch voters with better error handling
  const fetchVoters = async () => {
    if (!isAuthenticated()) {
      console.log('Not authenticated, skipping voter fetch');
      return;
    }

    const token = getAuthToken();
    setLoadingVoters(true);

    try {
      const response = await fetch("https://elections-backend-j8m8.onrender.com/api/admin/voters", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        showNotification("Session expired. Please login again.", "error");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch voters: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched voters:', data);
      
      if (data.success) {
        setVoters(data.voters || []);
      } else {
        showNotification(data.message || "Failed to fetch voters", "error");
      }
    } catch (error) {
      console.error('Fetch voters error:', error);
      showNotification("Error fetching voters", "error");
    } finally {
      setLoadingVoters(false);
    }
  };

  // Load voters on component mount and when auth changes
  useEffect(() => {
    if (isAuthenticated()) {
      fetchVoters();
    }
  }, []);

  // Check auth status on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      showNotification("Please ensure you are logged in as an admin", "warning");
    }
  }, []);

  const quickActions = [
    { icon: Plus, label: 'Create Election', color: 'bg-blue-500 hover:bg-blue-600', action: () => openModal('createElection') },
    { icon: Trophy, label: 'Add Candidate', color: 'bg-green-500 hover:bg-green-600', action: () => openModal('addCandidate') },
    { icon: UserPlus, label: 'Create Voter Account', color: 'bg-purple-500 hover:bg-purple-600', action: () => setActiveTab('voters') },
    { icon: BarChart3, label: 'View Reports', color: 'bg-orange-500 hover:bg-orange-600', action: () => setActiveTab('reports') }
  ];

  const openModal = (type, data = null) => {
    setShowModal(type);
    if (type === 'editElection' && data) {
      setSelectedElection(data);
      setFormData(data);
    } else if (type === 'editCandidate' && data) {
      setSelectedCandidate(data);
      setFormData(data);
    } else if (type === 'editUser' && data) {
      setSelectedUser(data);
      setFormData(data);
    } else {
      setFormData({});
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedElection(null);
    setSelectedCandidate(null);
    setSelectedUser(null);
    setFormData({});
  };

  const handleCandidateImageUpload = async (candidateId, file) => {
    setImageUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("candidateId", candidateId);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        
        setCandidates(prev => prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, image: imageUrl }
            : candidate
        ));

        const candidateName = candidates.find(c => c.id === candidateId)?.name || 'Unknown';
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'candidate',
            action: `Photo uploaded for candidate ${candidateName}`,
            time: 'Just now',
            status: 'success'
          },
          ...prev.slice(0, 4)
        ]);

        console.log('Image uploaded successfully for candidate:', candidateId);
      };
      reader.readAsDataURL(file);
   
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      const newElection = {
        id: Date.now(),
        ...formData,
        totalVotes: 0,
        totalCandidates: 0
      };
      setElections([...elections, newElection]);
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'election',
          action: `New election "${formData.title}" created`,
          time: 'Just now',
          status: 'success'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  const handleUpdateElection = async () => {
    try {
      setElections(elections.map(e => e.id === selectedElection.id ? { ...e, ...formData } : e));
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'election',
          action: `Election "${formData.title}" updated`,
          time: 'Just now',
          status: 'info'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error updating election:', error);
    }
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        const election = elections.find(e => e.id === id);
        setElections(elections.filter(e => e.id !== id));
        
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'election',
            action: `Election "${election?.title}" deleted`,
            time: 'Just now',
            status: 'completed'
          },
          ...prev.slice(0, 4)
        ]);
      } catch (error) {
        console.error('Error deleting election:', error);
      }
    }
  };

  const handleAddCandidate = async () => {
    try {
      const selectedElectionTitle = elections.find(e => e.id == formData.electionId)?.title || 'Unknown Election';
      const newCandidate = {
        id: Date.now(),
        ...formData,
        electionTitle: selectedElectionTitle,
        votes: 0,
        image: null
      };
      setCandidates([...candidates, newCandidate]);
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'candidate',
          action: `${formData.name} registered for ${formData.position} position`,
          time: 'Just now',
          status: 'success'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      const selectedElectionTitle = elections.find(e => e.id == formData.electionId)?.title || 'Unknown Election';
      setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { 
        ...c, 
        ...formData,
        electionTitle: selectedElectionTitle 
      } : c));
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'candidate',
          action: `Candidate ${formData.name} information updated`,
          time: 'Just now',
          status: 'info'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        const candidate = candidates.find(c => c.id === id);
        setCandidates(candidates.filter(c => c.id !== id));
        
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'candidate',
            action: `Candidate ${candidate?.name} removed`,
            time: 'Just now',
            status: 'completed'
          },
          ...prev.slice(0, 4)
        ]);
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      const newUser = {
        id: Date.now(),
        ...formData,
        status: 'active'
      };
      setUsers([...users, newUser]);
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'user',
          action: `New ${formData.role} account created for ${formData.name}`,
          time: 'Just now',
          status: 'success'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'user',
          action: `User ${formData.name} information updated`,
          time: 'Just now',
          status: 'info'
        },
        ...prev.slice(0, 4)
      ]);
      
      closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const user = users.find(u => u.id === id);
        setUsers(users.filter(u => u.id !== id));
        
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'user',
            action: `User ${user?.name} account deleted`,
            time: 'Just now',
            status: 'completed'
          },
          ...prev.slice(0, 4)
        ]);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const exportResults = async (format, electionId = null) => {
    try {
      console.log(`Exporting ${format} for election ${electionId || 'all'}`);
      
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'election',
          action: `Results exported in ${format.toUpperCase()} format`,
          time: 'Just now',
          status: 'info'
        },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'election': return <Calendar size={16} />;
      case 'candidate': return <Trophy size={16} />;
      case 'vote': return <BarChart3 size={16} />;
      case 'user': return <Users size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
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

  if (loading && activeTab !== 'voters') {
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
      {/* Loading overlay for image upload */}
      {imageUploadLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Uploading image...</span>
          </div>
        </div>
      )}

      {/* Authentication Warning */}
      {!isAuthenticated() && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Authentication Required:</strong> You must be logged in as an admin to access this dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage elections, candidates, and users.</p>
              {window.authData?.user && (
                <p className="text-sm text-gray-500 mt-1">
                  Logged in as: {window.authData.user.name} ({window.authData.user.role})
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 border-t pt-4">
            <nav className="flex space-x-8">
              {['dashboard', 'elections', 'candidates', 'users', 'voters', 'reports'].map((tab) => (
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

      {/* Notification */}
      {notification.message && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className={`p-4 rounded-lg border ${
            notification.type === "error" ? "bg-red-50 text-red-700 border-red-200" :
            notification.type === "success" ? "bg-green-50 text-green-700 border-green-200" :
            notification.type === "warning" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
            "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            recentActivity={recentActivity}
            elections={elections}
            quickActions={quickActions}
            getActivityIcon={getActivityIcon}
            getActivityColor={getActivityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'elections' && (
          <Elections
            elections={elections}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            openModal={openModal}
            handleDeleteElection={handleDeleteElection}
            exportResults={exportResults}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'candidates' && (
          <Candidates
            candidates={candidates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openModal={openModal}
            handleDeleteCandidate={handleDeleteCandidate}
            onImageUpload={handleCandidateImageUpload}
          />
        )}

        {activeTab === 'users' && (
          <UserAccount
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openModal={openModal}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {/* Voters Tab - Enhanced with better auth handling */}
        {activeTab === 'voters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Voter Management</h2>
                <p className="text-gray-600 mt-1">Create and manage voter accounts</p>
              </div>
            </div>

            {!isAuthenticated() ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
                <p className="text-yellow-700">Please login as an admin to access voter management features.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Voter Form */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <UserPlus className="text-purple-600" size={20} />
                      Create New Voter
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Voter Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={voterFormData.name}
                          onChange={handleVoterChange}
                          placeholder="Enter voter's full name"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={voterFormData.email}
                          onChange={handleVoterChange}
                          placeholder="Enter voter's email address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          If not provided, a system email will be generated
                        </p>
                      </div>

                      <button
                        onClick={handleCreateVoter}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Creating Voter..." : "Create Voter"}
                      </button>
                    </div>
                  </div>

                  {/* Created Voter Credentials */}
                  {createdVoter && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-green-600">
                        ✅ Voter Created Successfully!
                      </h3>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-gray-700 font-medium">
                          Share these credentials with the voter:
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white p-3 rounded border">
                            <div>
                              <span className="text-xs text-gray-500">User ID:</span>
                              <p className="font-mono font-bold text-gray-800">
                                {createdVoter.credentials.userId}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(createdVoter.credentials.userId, "User ID")}
                              className="text-gray-500 hover:text-purple-600 transition"
                            >
                              {copiedField === "User ID" ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white p-3 rounded border">
                            <div>
                              <span className="text-xs text-gray-500">Password:</span>
                              <p className="font-mono font-bold text-gray-800">
                                {createdVoter.credentials.password}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(createdVoter.credentials.password, "Password")}
                              className="text-gray-500 hover:text-purple-600 transition"
                            >
                              {copiedField === "Password" ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-3">
                          ⚠️ Make sure to share these credentials securely with the voter. 
                          The password cannot be retrieved again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voters List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye className="text-purple-600" size={20} />
                    All Voters ({voters.length})
                  </h3>

                  {loadingVoters ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading voters...
                    </div>
                  ) : voters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No voters created yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 font-medium text-gray-700">Name</th>
                            <th className="text-left p-3 font-medium text-gray-700">User ID</th>
                            <th className="text-left p-3 font-medium text-gray-700">Email</th>
                            <th className="text-left p-3 font-medium text-gray-700">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {voters.map((voter) => (
                            <tr key={voter._id} className="hover:bg-gray-50">
                              <td className="p-3 font-medium text-gray-800">{voter.name}</td>
                              <td className="p-3 font-mono text-gray-600">{voter.userId}</td>
                              <td className="p-3 text-gray-600">{voter.email}</td>
                              <td className="p-3 text-gray-600">
                                {new Date(voter.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports
            elections={elections}
            candidates={candidates}
            users={users}
            exportResults={exportResults}
            getStatusColor={getStatusColor}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Create/Edit Election Modal */}
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

              {/* Add/Edit Candidate Modal */}
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

              {/* Create/Edit User Modal */}
              {(showModal === 'createUser' || showModal === 'editUser') && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showModal === 'createUser' ? 'Create New User Account' : 'Edit User Account'}
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
                          placeholder="Enter user's full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="user@university.edu"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={formData.role || ''}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select role</option>
                          <option value="voter">Voter</option>
                          <option value="candidate">Candidate</option>
                          <option value="admin">Admin</option>
                        </select>
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
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={showModal === 'createUser' ? handleCreateUser : handleUpdateUser}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === 'createUser' ? 'Create User' : 'Update User'}
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