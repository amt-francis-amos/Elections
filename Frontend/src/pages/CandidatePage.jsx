import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, User, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';


const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMTAgMTgwQzIxMCAxOTQuMzA3IDE5OC4zMDcgMjA2IDE4NCAyMDZIMTE2QzEwMS42OTMgMjA2IDkwIDE5NC4zMDcgOTAgMTgwVjE4MEg5MEMyMTAgMTgwIDIxMCAxODAiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTIwIiByPSI0MCIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    position: "",
    description: "",
    electionId: "",
    image: null
  });

  const messageTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      showMessage("Please login to continue", "error");
      return;
    }
    setToken(storedToken);
  }, []);

  // Cleanup message timeout
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
    if (!candidateForm.name.trim()) {
      showMessage("Candidate name is required", "error");
      return false;
    }
    if (!candidateForm.position.trim()) {
      showMessage("Position is required", "error");
      return false;
    }
    if (!candidateForm.electionId) {
      showMessage("Please select an election", "error");
      return false;
    }
    if (candidateForm.image && candidateForm.image.size > 5 * 1024 * 1024) {
      showMessage("Image size must be less than 5MB", "error");
      return false;
    }
    return true;
  }, [candidateForm, showMessage]);

  const fetchElections = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`https://elections-backend-j8m8.onrender.com/api/elections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElections(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        showMessage("Session expired. Please login again", "error");
        localStorage.removeItem('token');
        return;
      }
      console.error("Error fetching elections:", error);
      showMessage("Failed to fetch elections", "error");
    }
  }, [token, showMessage]);

  const fetchCandidates = useCallback(async () => {
    if (!token || elections.length === 0) return;
    
    try {
      // Use Promise.all for parallel requests
      const candidatePromises = elections.map(election =>
        axios.get(`${API_BASE_URL}/api/candidates/${election._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => 
          response.data.map(candidate => ({
            ...candidate,
            description: candidate.description || "No description available",
            votes: candidate.votes || 0,
            electionId: candidate.election
          }))
        ).catch(error => {
          console.error(`Error fetching candidates for election ${election._id}:`, error);
          return [];
        })
      );

      const results = await Promise.all(candidatePromises);
      const allCandidates = results.flat();
      setCandidates(allCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      showMessage("Failed to fetch candidates", "error");
    }
  }, [token, elections, showMessage]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) return;
      
      setLoading(true);
      await fetchElections();
      setLoading(false);
    };
    
    loadInitialData();
  }, [token, fetchElections]);

  // Fetch candidates when elections change
  useEffect(() => {
    if (elections.length > 0) {
      fetchCandidates();
    }
  }, [elections, fetchCandidates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage("Please select a valid image file", "error");
        e.target.value = '';
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Image size must be less than 5MB", "error");
        e.target.value = '';
        return;
      }
    }
    
    setCandidateForm(prev => ({ ...prev, image: file }));
  };

  const resetForm = useCallback(() => {
    setCandidateForm({
      name: "",
      position: "",
      description: "",
      electionId: "",
      image: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCreateCandidate = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", candidateForm.name.trim());
    formData.append("position", candidateForm.position.trim());
    formData.append("description", candidateForm.description.trim());
    formData.append("electionId", candidateForm.electionId);
    
    if (candidateForm.image) {
      formData.append("image", candidateForm.image);
    }

    try {
      const response = await axios.post(`https://elections-backend-j8m8.onrender.com/api/candidates`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      const newCandidate = response.data.candidate;
      setCandidates(prev => [...prev, {
        ...newCandidate,
        description: candidateForm.description.trim() || "No description available",
        votes: 0,
        electionId: newCandidate.election
      }]);

      resetForm();
      setShowModal(false);
      showMessage("Candidate added successfully!", "success");
    } catch (error) {
      console.error("Error creating candidate:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please login again", "error");
        localStorage.removeItem('token');
        return;
      }
      const message = error.response?.data?.message || "Error adding candidate";
      showMessage(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return;
    }

    try {
      await axios.delete(`https://elections-backend-j8m8.onrender.com/api/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCandidates(prev => prev.filter(c => c._id !== id));
      showMessage("Candidate deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      showMessage("Failed to delete candidate", "error");
    }
  };

  const handleModalClose = () => {
    resetForm();
    setShowModal(false);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading candidates...</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Candidates Management</h1>
              <p className="text-gray-600 mt-1">Manage candidate registrations and profiles</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Add new candidate"
            >
              <Plus size={20} />
              Add Candidate
            </button>
          </div>
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

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search candidates"
            />
          </div>
        </div>

        {/* Candidates Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          {filteredCandidates.map((candidate) => {
            const election = elections.find(e => e._id === candidate.electionId);
            return (
              <motion.div
                key={candidate._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={candidate.image || DEFAULT_AVATAR}
                    alt={`${candidate.name} profile`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{candidate.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{candidate.position}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{candidate.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Election:</span>
                      <span className="font-medium text-gray-900">{election?.title || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Votes:</span>
                      <span className="font-semibold text-green-600">{candidate.votes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        election?.status === 'active' ? 'bg-green-100 text-green-800' :
                        election?.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {election?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button 
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="View candidate details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Edit candidate"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete candidate"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No candidates found</p>
            <p className="text-gray-400">Try adjusting your search or add a new candidate</p>
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
            <div className="p-6 border-b border-gray-200">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900">Add New Candidate</h3>
              <p className="text-sm text-gray-600 mt-1">Register a new candidate for an election</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="candidate-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Name *
                </label>
                <input 
                  id="candidate-name"
                  type="text" 
                  name="name" 
                  value={candidateForm.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Enter candidate name"
                  required
                />
              </div>

              <div>
                <label htmlFor="candidate-position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input 
                  id="candidate-position"
                  type="text" 
                  name="position" 
                  value={candidateForm.position} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="e.g., President"
                  required
                />
              </div>

              <div>
                <label htmlFor="candidate-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  id="candidate-description"
                  name="description" 
                  value={candidateForm.description} 
                  onChange={handleInputChange} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Candidate description"
                />
              </div>

              <div>
                <label htmlFor="candidate-election" className="block text-sm font-medium text-gray-700 mb-1">
                  Election *
                </label>
                <select 
                  id="candidate-election"
                  name="electionId" 
                  value={candidateForm.electionId} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an election</option>
                  {elections.filter(e => e.status !== 'completed').map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="candidate-image" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <input 
                  id="candidate-image"
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={handleModalClose} 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCandidate} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {submitting ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;