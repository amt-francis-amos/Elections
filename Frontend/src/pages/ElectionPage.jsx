import React, { useEffect, useState } from 'react';
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

const mockElections = [
  { 
    _id: "1", 
    title: "SRC 2025 Elections", 
    description: "Student Representative Council executive elections for the academic year 2025.", 
    startDate: "2025-09-01", 
    endDate: "2025-09-03", 
    status: "upcoming", 
    totalVotes: 0,
    candidatesCount: 5
  },
  { 
    _id: "2", 
    title: "Faculty Board Elections", 
    description: "Annual faculty board member elections for academic governance.", 
    startDate: "2025-10-15", 
    endDate: "2025-10-17", 
    status: "draft", 
    totalVotes: 0,
    candidatesCount: 3
  },
  { 
    _id: "3", 
    title: "Alumni Association Elections", 
    description: "Alumni association leadership elections for community engagement.", 
    startDate: "2025-08-01", 
    endDate: "2025-08-03", 
    status: "completed", 
    totalVotes: 342,
    candidatesCount: 4
  },
  { 
    _id: "4", 
    title: "Sports Committee Elections", 
    description: "University sports committee elections for athletic governance.", 
    startDate: "2025-11-01", 
    endDate: "2025-11-02", 
    status: "active", 
    totalVotes: 128,
    candidatesCount: 6
  }
];

const ElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft"
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setElections(mockElections);
      setLoading(false);
    }, 1000);
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setElectionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateElection = () => {
    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      return showMessage("Please fill in all required fields", "error");
    }

    if (new Date(electionForm.startDate) >= new Date(electionForm.endDate)) {
      return showMessage("End date must be after start date", "error");
    }
    
    const newElection = {
      ...electionForm,
      _id: Date.now().toString(),
      totalVotes: 0,
      candidatesCount: 0
    };
    
    setElections(prev => [...prev, newElection]);
    setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "draft" });
    setShowModal(false);
    showMessage("Election created successfully!", "success");
  };

  const handleDeleteElection = (id) => {
    setElections(prev => prev.filter(e => e._id !== id));
    showMessage("Election deleted successfully", "success");
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

  const filteredElections = elections.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Elections Management</h1>
              <p className="text-gray-600 mt-1">Create and manage election campaigns</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              New Election
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Elections</p>
                <p className="text-2xl font-bold text-gray-900">{elections.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Elections</p>
                <p className="text-2xl font-bold text-green-600">
                  {elections.filter(e => e.status === "active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-purple-600">
                  {elections.reduce((sum, e) => sum + (e.candidatesCount || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
          {filteredElections.map((election) => (
            <motion.div
              key={election._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{election.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(election.status)}`}>
                    {getStatusIcon(election.status)}
                    {election.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(election.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{election.candidatesCount || 0} Candidates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 size={16} />
                      <span>{election.totalVotes || 0} Votes</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Election"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteElection(election._id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Election"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No elections found</p>
            <p className="text-gray-400">Try adjusting your search or create a new election</p>
          </div>
        )}
      </div>

      {/* Create Election Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create New Election</h3>
              <p className="text-sm text-gray-600 mt-1">Set up a new election campaign</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={electionForm.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter election title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={electionForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the election..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={electionForm.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={electionForm.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
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

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "draft" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateElection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Election
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ElectionsPage;