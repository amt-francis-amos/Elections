import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, User, Search, Eye, CheckCircle, XCircle } from 'lucide-react';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    position: "",
    description: "",
    electionId: "",
    image: null
  });

  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchElections = async () => {
    try {
      const res = await fetch('https://elections-backend-j8m8.onrender.com/api/elections', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setElections(data);
    } catch (error) {
      console.error('Fetch elections error:', error);
      showMessage("Failed to fetch elections", "error");
    }
  };

  const fetchCandidates = async () => {
    try {
      const all = [];
      for (let election of elections) {
        const res = await fetch(`https://elections-backend-j8m8.onrender.com/api/candidates/${election._id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        const candidatesWithElectionId = data.map(c => ({
          ...c,
          description: c.description || "No description provided",
          votes: c.votes || 0,
          electionId: c.election 
        }));
        all.push(...candidatesWithElectionId);
      }
      setCandidates(all);
    } catch (error) {
      console.error('Fetch candidates error:', error);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCandidateForm(prev => ({ ...prev, image: file }));
  };

  const handleCreateCandidate = async () => {
    if (!candidateForm.name || !candidateForm.position || !candidateForm.electionId) {
      return showMessage("Please fill in all required fields", "error");
    }

    const formData = new FormData();
    formData.append("name", candidateForm.name);
    formData.append("position", candidateForm.position);
    formData.append("electionId", candidateForm.electionId);
    
    if (candidateForm.description) {
      formData.append("description", candidateForm.description);
    }
    
    if (candidateForm.image) {
      formData.append("image", candidateForm.image);
    }

    try {
      const res = await fetch('https://elections-backend-j8m8.onrender.com/api/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();
      const newCandidate = {
        ...responseData.candidate,
        description: candidateForm.description || "No description provided",
        votes: 0,
        electionId: responseData.candidate.election
      };

      setCandidates(prev => [...prev, newCandidate]);
      setCandidateForm({ name: "", position: "", description: "", electionId: "", image: null });
      setShowModal(false);
      showMessage("Candidate added successfully!", "success");
    } catch (err) {
      console.error('Create candidate error:', err);
      showMessage(err.message || "Error adding candidate", "error");
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      const res = await fetch(`https://elections-backend-j8m8.onrender.com/api/candidates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      setCandidates(prev => prev.filter(c => c._id !== id));
      showMessage("Candidate removed successfully", "success");
    } catch (error) {
      console.error('Delete candidate error:', error);
      showMessage(error.message || "Failed to delete candidate", "error");
    }
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
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => {
            const election = elections.find(e => e._id === candidate.electionId);
            return (
              <div
                key={candidate._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face';
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
              </div>
            );
          })}
        </div>

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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Candidate</h3>
              <p className="text-sm text-gray-600 mt-1">Register a new candidate for an election</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={candidateForm.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Enter candidate name" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input 
                  type="text" 
                  name="position" 
                  value={candidateForm.position} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="e.g., President, Senator" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={candidateForm.description} 
                  onChange={handleInputChange} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Candidate description (optional)" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Election *</label>
                <select 
                  name="electionId" 
                  value={candidateForm.electionId} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an election</option>
                  {elections.filter(e => e.status !== 'completed').map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => { 
                  setShowModal(false); 
                  setCandidateForm({ name: "", position: "", description: "", electionId: "", image: null }); 
                }} 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCandidate} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;