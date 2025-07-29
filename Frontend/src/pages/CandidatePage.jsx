import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, User, Search, Eye } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    position: "",
    description: "",
    electionId: "",
    image: null
  });

  const token = localStorage.getItem('token');

  const showMessage = (text, type = "success") => {
    toast[type](text);
  };

  const fetchElections = async () => {
    try {
      const res = await axios.get(`https://elections-backend-j8m8.onrender.com/api/elections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElections(res.data);
    } catch {
      showMessage("Failed to fetch elections", "error");
    }
  };

  const fetchCandidates = async () => {
    try {
      const all = [];
      for (let election of elections) {
        const res = await axios.get(`https://elections-backend-j8m8.onrender.com/api/candidates/${election._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.map(c => ({
          ...c,
          description: "Candidate details",
          votes: 0,
          electionId: c.election
        }));
        all.push(...data);
      }
      setCandidates(all);
    } catch {
      showMessage("Failed to fetch candidates", "error");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchElections();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (elections.length > 0) {
      fetchCandidates();
    }
  }, [elections]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCandidate = async () => {
    if (!candidateForm.name || !candidateForm.position || !candidateForm.electionId) {
      return showMessage("Please fill in all required fields", "error");
    }

    const formData = new FormData();
    formData.append("name", candidateForm.name);
    formData.append("position", candidateForm.position);
    formData.append("description", candidateForm.description);
    formData.append("electionId", candidateForm.electionId);
    if (candidateForm.image) {
      formData.append("image", candidateForm.image);
    }

    try {
      const res = await axios.post(`https://elections-backend-j8m8.onrender.com/api/candidates`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      const newCandidate = res.data.candidate;
      setCandidates(prev => [...prev, {
        ...newCandidate,
        description: candidateForm.description,
        votes: 0,
        electionId: newCandidate.election
      }]);

      setCandidateForm({ name: "", position: "", description: "", electionId: "", image: null });
      setShowModal(false);
      showMessage("Candidate added successfully!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Error adding candidate";
      showMessage(msg, "error");
    }
  };

  const handleDeleteCandidate = (id) => {
    setCandidates(prev => prev.filter(c => c._id !== id));
    showMessage("Candidate removed successfully", "success");
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
      <ToastContainer position="top-right" autoClose={4000} />
      
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidates Management</h1>
              <p className="text-gray-600 mt-1">Manage candidate registrations and profiles</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

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
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/300';
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
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No candidates found</p>
            <p className="text-gray-400">Try adjusting your search or add a new candidate</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Candidate</h3>
              <p className="text-sm text-gray-600 mt-1">Register a new candidate for an election</p>
            </div>

            <div className="p-6 space-y-4">
              <input type="text" name="name" value={candidateForm.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter candidate name" />
              <input type="text" name="position" value={candidateForm.position} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g., President" />
              <textarea name="description" value={candidateForm.description} onChange={handleInputChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Candidate description" />
              <select name="electionId" value={candidateForm.electionId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Select an election</option>
                {elections.filter(e => e.status !== 'completed').map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={e => setCandidateForm(prev => ({ ...prev, image: e.target.files[0] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); setCandidateForm({ name: "", position: "", description: "", electionId: "", image: null }); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleCreateCandidate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Add Candidate</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
