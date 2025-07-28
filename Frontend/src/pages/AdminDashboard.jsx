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
  Phone
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Plus, label: 'Create Election', color: 'bg-blue-500 hover:bg-blue-600', action: () => openModal('createElection') },
    { icon: Trophy, label: 'Add Candidate', color: 'bg-green-500 hover:bg-green-600', action: () => openModal('addCandidate') },
    { icon: UserPlus, label: 'Create Voter Account', color: 'bg-purple-500 hover:bg-purple-600', action: () => openModal('createUser') },
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

  const handleCreateElection = async () => {
    try {
     
      closeModal();
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  const handleUpdateElection = async () => {
    try {
      
      closeModal();
    } catch (error) {
      console.error('Error updating election:', error);
    }
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        
      } catch (error) {
        console.error('Error deleting election:', error);
      }
    }
  };

  const handleAddCandidate = async () => {
    try {
     
      closeModal();
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
     
      closeModal();
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
       
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const handleCreateUser = async () => {
    try {
     
      closeModal();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
     
      closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const exportResults = async (format, electionId = null) => {
    try {
      
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

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || election.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredCandidates = candidates.filter(candidate => {
    return candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           candidate.electionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(user => {
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.role?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
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
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <nav className="flex space-x-8">
              {['dashboard', 'elections', 'candidates', 'users', 'reports'].map((tab) => (
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
          <div className="space-y-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Elections</p>
                    <p className="text-3xl font-bold">{stats.totalElections}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-200" />
                  <span className="text-sm text-blue-100">{stats.activeElections} Active</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Candidates</p>
                    <p className="text-3xl font-bold">{stats.totalCandidates}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Registered Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total Votes</p>
                    <p className="text-3xl font-bold">{stats.totalVotes}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-200" />
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">Participation</p>
                    <p className="text-3xl font-bold">
                      {stats.totalUsers > 0 ? Math.round((stats.totalVotes / stats.totalUsers) * 100) : 0}%
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-indigo-200" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-colors`}
                    >
                      <Icon size={24} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity size={20} />
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    ) : (
                      recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} />
                    Active Elections
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {elections.filter(e => e.status === 'active' || e.status === 'upcoming').length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No active elections</p>
                    ) : (
                      elections.filter(e => e.status === 'active' || e.status === 'upcoming').slice(0, 3).map((election) => (
                        <div key={election.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{election.title}</h4>
                            <p className="text-sm text-gray-600">
                              {election.totalVotes} votes • {election.totalCandidates} candidates
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                              {election.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'elections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Elections Management</h2>
              <button
                onClick={() => openModal('createElection')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Create Election
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search elections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => exportResults('csv')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredElections.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No elections found
                        </td>
                      </tr>
                    ) : (
                      filteredElections.map((election) => (
                        <tr key={election.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{election.title}</div>
                              <div className="text-sm text-gray-500">{election.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                              {election.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{new Date(election.startDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">to {new Date(election.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {election.totalVotes} / {election.eligibleVoters} votes
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${election.eligibleVoters > 0 ? (election.totalVotes / election.eligibleVoters) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {election.eligibleVoters > 0 ? ((election.totalVotes / election.eligibleVoters) * 100).toFixed(1) : 0}% turnout
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal('editElection', election)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => exportResults('csv', election.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteElection(election.id)}
                                className="text-red-600 hover:text-red-900"
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
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Candidates Management</h2>
              <button
                onClick={() => openModal('addCandidate')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Candidate
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredCandidates.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No candidates found
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users size={24} className="text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('editCandidate', candidate)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-blue-600 font-medium">{candidate.position}</p>
                        <p className="text-sm text-gray-600">{candidate.electionTitle}</p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} />
                          <span>{candidate.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone size={14} />
                          <span>{candidate.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>{candidate.department} • {candidate.year}</span>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Votes Received</span>
                            <span className="text-lg font-bold text-blue-600">{candidate.votes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
                    placeholder="Search users..."
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                <Users size={20} className="text-gray-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.department}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal('editUser', user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
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
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <button
                onClick={() => exportResults('csv')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download size={16} />
                Export All Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart size={20} />
                  Voter Turnout by Election
                </h3>
                <div className="space-y-4">
                  {elections.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No elections data available</p>
                  ) : (
                    elections.map((election) => (
                      <div key={election.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{election.title}</span>
                          <span className="text-sm text-gray-500">
                            {election.eligibleVoters > 0 ? ((election.totalVotes / election.eligibleVoters) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${election.eligibleVoters > 0 ? (election.totalVotes / election.eligibleVoters) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {election.totalVotes} of {election.eligibleVoters} eligible voters
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Election Statistics
                </h3>
                <div className="space-y-4">
                  {elections.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No elections data available</p>
                  ) : (
                    elections.map((election) => (
                      <div key={election.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">{election.title}</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(election.status)}`}>
                              {election.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Candidates:</span>
                            <span className="ml-2 font-medium">{election.totalCandidates || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Votes:</span>
                            <span className="ml-2 font-medium">{election.totalVotes || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Eligible Voters:</span>
                            <span className="ml-2 font-medium">{election.eligibleVoters || 0}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <button
                            onClick={() => exportResults('csv', election.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Download size={14} />
                            Export Results
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users2 size={20} />
                Top Performing Candidates
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No candidates data available
                        </td>
                      </tr>
                    ) : (
                      candidates
                        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                        .slice(0, 10)
                        .map((candidate, index) => (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">#{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                  <Users size={16} className="text-gray-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                  <div className="text-sm text-gray-500">{candidate.department}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{candidate.position}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{candidate.electionTitle}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {candidate.votes || 0} votes
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Positions (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.positions || ''}
                        onChange={(e) => setFormData({...formData, positions: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="President, Vice President, Secretary"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year/Level</label>
                        <input
                          type="text"
                          value={formData.year || ''}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3rd Year, Faculty, etc."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto</label>
                      <textarea
                        value={formData.manifesto || ''}
                        onChange={(e) => setFormData({...formData, manifesto: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        placeholder="Enter candidate's manifesto or key promises"
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
                      onClick={showModal === 'addCandidate' ? handleAddCandidate : handleUpdateCandidate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === 'addCandidate' ? 'Add Candidate' : 'Update Candidate'}
                    </button>
                  </div>
                </div>
              )}

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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                        <input
                          type="text"
                          value={formData.studentId || ''}
                          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter student ID"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                    </div>

                    {showModal === 'createUser' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter temporary password"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
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