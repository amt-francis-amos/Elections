import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react'

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken')
  try {
    const config = {
      url: `https://elections-backend-j8m8.onrender.com/api${endpoint}`,
      method: options.method || 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      data: options.body || undefined,
    }
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    const response = await axios(config)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    throw new Error(error.response?.data?.message || 'Request failed')
  }
}

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([])
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedElectionId, setSelectedElectionId] = useState('')
  const [message, setMessage] = useState(null)
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    position: '',
    electionId: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetchElections()
  }, [])

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId)
    } else {
      setCandidates([])
      setLoading(false)
    }
  }, [selectedElectionId])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchElections = async () => {
    try {
      const data = await apiRequest('/elections')
      setElections(data)
      const activeElection = data.find(e => e.status === 'active' || e.status === 'upcoming')
      if (activeElection) {
        setSelectedElectionId(activeElection._id)
      } else if (data.length > 0) {
        setSelectedElectionId(data[0]._id)
      }
    } catch (error) {
      showMessage(error.message || 'Failed to fetch elections', 'error')
    }
  }

  const fetchCandidates = async electionId => {
    if (!electionId) return
    setLoading(true)
    try {
      const data = await apiRequest(`/candidates/${electionId}`)
      setCandidates(data)
    } catch (error) {
      showMessage(error.message || 'Failed to fetch candidates', 'error')
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setCandidateForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('Please select a valid image file', 'error')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size should be less than 5MB', 'error')
        return
      }
      setCandidateForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = e => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setCandidateForm(prev => ({ ...prev, image: null }))
    setImagePreview('')
    const fileInput = document.getElementById('imageInput')
    if (fileInput) fileInput.value = ''
  }

  const handleCreateCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.position.trim() || !candidateForm.electionId) {
      return showMessage('Please fill in all required fields', 'error')
    }
    if (!candidateForm.image) {
      return showMessage('Please select a candidate image', 'error')
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', candidateForm.name.trim())
      formData.append('position', candidateForm.position.trim())
      formData.append('electionId', candidateForm.electionId)
      formData.append('image', candidateForm.image)
      const response = await apiRequest('/candidates', {
        method: 'POST',
        body: formData,
      })
      if (candidateForm.electionId === selectedElectionId) {
        setCandidates(prev => [response.candidate, ...prev])
      }
      setCandidateForm({ name: '', position: '', electionId: '', image: null })
      setImagePreview('')
      setShowModal(false)
      showMessage('Candidate added successfully!', 'success')
    } catch (error) {
      showMessage(error.message || 'Failed to add candidate', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCandidate = async id => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return
    try {
      await apiRequest(`/candidates/${id}`, { method: 'DELETE' })
      setCandidates(prev => prev.filter(c => c._id !== id))
      showMessage('Candidate deleted successfully', 'success')
    } catch (error) {
      showMessage(error.message || 'Failed to delete candidate', 'error')
    }
  }

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedElection = elections.find(e => e._id === selectedElectionId)

  if (loading && selectedElectionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading candidates...</span>
        </div>
      </div>
    )
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
            <div className="flex gap-3">
              <button
                onClick={() => selectedElectionId && fetchCandidates(selectedElectionId)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                disabled={!selectedElectionId}
              >
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                disabled={!selectedElectionId}
              >
                <Plus size={20} />
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Election</label>
          <div className="max-w-md">
            <select
              value={selectedElectionId}
              onChange={e => setSelectedElectionId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose an election</option>
              {elections.map(election => (
                <option key={election._id} value={election._id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedElectionId && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {!selectedElectionId && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Select an election to view candidates</p>
            <p className="text-gray-400">Choose an election from the dropdown above</p>
          </div>
        )}

        {selectedElectionId && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {filteredCandidates.map(candidate => (
              <motion.div
                key={candidate._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-48 object-cover"
                    onError={e => {
                      e.target.src = 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=No+Image'
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
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Election:</span>
                      <span className="font-medium text-gray-900">{selectedElection?.title || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Votes:</span>
                      <span className="font-semibold text-green-600">{candidate.votes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedElection?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : selectedElection?.status === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedElection?.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Added:</span>
                      <span className="text-gray-600 text-xs">
                        {new Date(candidate.createdAt).toLocaleDateString()}
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
            ))}
          </motion.div>
        )}

        {selectedElectionId && filteredCandidates.length === 0 && !loading && (
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={candidateForm.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter candidate name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={candidateForm.position}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., President, Vice President"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election <span className="text-red-500">*</span>
                </label>
                <select
                  name="electionId"
                  value={candidateForm.electionId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select an election</option>
                  {elections
                    .filter(election => election.status !== 'completed')
                    .map(election => (
                      <option key={election._id} value={election._id}>
                        {election.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Image <span className="text-red-500">*</span>
                </label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="imageInput" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload candidate image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setCandidateForm({ name: '', position: '', electionId: '', image: null })
                  setImagePreview('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCandidate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isSubmitting ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CandidatesPage
