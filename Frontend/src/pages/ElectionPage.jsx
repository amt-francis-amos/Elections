import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  BarChart3
} from 'lucide-react';
import axios from 'axios';



const ElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft"
  });

  const messageTimeoutRef = useRef(null);

 
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      showMessage("Please login to continue", "error");
      return;
    }
    setToken(storedToken);
  }, []);


  useEffect(() => {
    if (message) {
      messageTimeoutRef.current = setTimeout(() => setMessage(null), 4000);
      return () => {
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
      };
    }
  }, [message]);

  const showMessage = useCallback((text, type = "success") => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage({ text, type });
  }, []);

  const validateForm = useCallback(() => {
    const { title, startDate, endDate } = electionForm;
    
    if (!title.trim()) {
      showMessage("Election title is required", "error");
      return false;
    }
    
    if (!startDate) {
      showMessage("Start date is required", "error");
      return false;
    }
    
    if (!endDate) {
      showMessage("End date is required", "error");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start >= end) {
      showMessage("End date must be after start date", "error");
      return false;
    }
    
  
    if (['draft', 'upcoming'].includes(electionForm.status)) {
      if (start < now.setHours(0, 0, 0, 0)) {
        showMessage("Start date cannot be in the past", "error");
        return false;
      }
    }
    
    return true;
  }, [electionForm, showMessage]);

  const fetchElections = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`https://elections-backend-j8m8.onrender.com/api/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setElections(response.data);
    } catch (error) {
      console.error("Error fetching elections:", error);
      
      if (error.response?.status === 401) {
        showMessage("Session expired. Please login again", "error");
        localStorage.removeItem('token');
        return;
      }
      
      showMessage("Failed to load elections", "error");
    }
  }, [token, showMessage]);


  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) return;
      
      setLoading(true);
      await fetchElections();
      setLoading(false);
    };
    
    loadInitialData();
  }, [token, fetchElections]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setElectionForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = useCallback(() => {
    setElectionForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "draft"
    });
  }, []);

  const handleCreateElection = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await axios.post(`https://elections-backend-j8m8.onrender.com/api/elections`, {
        ...electionForm,
        title: electionForm.title.trim(),
        description: electionForm.description.trim()
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setElections(prev => [response.data.election, ...prev]);
      resetForm();
      setShowModal(false);
      showMessage("Election created successfully!", "success");
    } catch (error) {
      console.error("Error creating election:", error);
      
      if (error.response?.status === 401) {
        showMessage("Session expired. Please login again", "error");
        localStorage.removeItem('token');
        return;
      }
      
      const message = error.response?.data?.message || "Failed to create election";
      showMessage(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteElection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`$https://elections-backend-j8m8.onrender.com/api/elections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setElections(prev => prev.filter(e => e._id !== id));
      showMessage("Election deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting election:", error);
      
      if (error.response?.status === 401) {
        showMessage("Session expired. Please login again", "error");
        localStorage.removeItem('token');
        return;
      }
      
      showMessage("Failed to delete election", "error");
    }
  };

  const handleModalClose = () => {
    resetForm();
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "upcoming":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "draft":
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const filteredElections = elections.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading elections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Elections Management</h1>
            <p className="text-gray-600 mt-1">Create and manage election campaigns</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Create new election"
          >
            <Plus size={20} />
            New Election
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Elections" 
            value={elections.length} 
            icon={<Calendar className="text-blue-500" />} 
          />
          <StatCard 
            title="Active Elections" 
            value={elections.filter(e => e.status === "active").length} 
            icon={<CheckCircle className="text-green-500" />} 
          />
          <StatCard 
            title="Total Candidates" 
            value={elections.reduce((sum, e) => sum + (e.candidatesCount || 0), 0)} 
            icon={<Users className="text-purple-500" />} 
          />
          <StatCard 
            title="Total Votes" 
            value={elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0)} 
            icon={<BarChart3 className="text-orange-500" />} 
          />
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search elections"
          />
        </div>

        {/* Elections Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {filteredElections.map(election => (
            <motion.div 
              key={election._id} 
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{election.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{election.description || 'No description provided'}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ml-4 ${getStatusColor(election.status)}`}>
                  {getStatusIcon(election.status)}
                  {election.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Info 
                  label="Start Date" 
                  value={formatDate(election.startDate)} 
                />
                <Info 
                  label="End Date" 
                  value={formatDate(election.endDate)} 
                />
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Users size={16} /> 
                  {election.candidatesCount || 0} Candidates
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={16} /> 
                  {election.totalVotes || 0} Votes
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  aria-label="View election details"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" 
                  aria-label="Edit election"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteElection(election._id)} 
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" 
                  aria-label="Delete election"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No elections found</p>
            <p className="text-gray-400">Try adjusting your search or create a new election</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && handleModalClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="p-6 border-b">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900">Create New Election</h3>
              <p className="text-sm text-gray-600 mt-1">Set up a new election campaign</p>
            </div>
            
            <div className="p-6 space-y-4">
              <Input 
                label="Election Title" 
                name="title" 
                value={electionForm.title} 
                onChange={handleInputChange} 
                required 
                placeholder="Enter election title"
              />
              
              <Textarea 
                label="Description" 
                name="description" 
                value={electionForm.description} 
                onChange={handleInputChange} 
                placeholder="Describe the election purpose and details"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Start Date" 
                  name="startDate" 
                  type="date" 
                  value={electionForm.startDate} 
                  onChange={handleInputChange} 
                  required 
                />
                <Input 
                  label="End Date" 
                  name="endDate" 
                  type="date" 
                  value={electionForm.endDate} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="election-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  id="election-status"
                  name="status" 
                  value={electionForm.status} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button 
                onClick={handleModalClose} 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateElection} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {submitting ? 'Creating...' : 'Create Election'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900 text-sm">{value}</p>
  </div>
);

const Input = ({ label, name, value, onChange, type = "text", required, placeholder }) => (
  <div>
    <label htmlFor={`election-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={`election-${name}`}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
    />
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={`election-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={`election-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      rows={3}
    />
  </div>
);

export default ElectionsPage;