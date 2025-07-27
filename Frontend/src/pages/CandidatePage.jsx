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
  const [showDetails, setShowDetails] = useState(false)
  const [displayCandidate, setDisplayCandidate] = useState(null)
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
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId);
    }
  }, [selectedElectionId]);


  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchElections = async () => {
    try {
      const data = await apiRequest('/elections')
      setElections(data)
      const active = data.find(e => e.status === 'active' || e.status === 'upcoming')
      setSelectedElectionId(active ? active._id : data[0]?._id || '')
    } catch (error) {
      showMessage(error.message || 'Failed to fetch elections', 'error')
    }
  }

  const fetchCandidates = async id => {
    setLoading(true)
    try {
      const data = await apiRequest(`/candidates/election/${id}`)
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
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setCandidateForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = ev => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      showMessage('Invalid image', 'error')
    }
  }

  const removeImage = () => {
    setCandidateForm(prev => ({ ...prev, image: null }))
    setImagePreview('')
    const inp = document.getElementById('imageInput')
    if (inp) inp.value = ''
  }

  const handleCreateCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.position.trim() || !candidateForm.electionId || !candidateForm.image) {
      return showMessage('Fill all fields', 'error')
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', candidateForm.name.trim())
      formData.append('position', candidateForm.position.trim())
      formData.append('electionId', candidateForm.electionId)
      formData.append('image', candidateForm.image)
      const res = await apiRequest('/candidates', { method: 'POST', body: formData })
      if (candidateForm.electionId === selectedElectionId) {
        setCandidates(prev => [res.candidate, ...prev])
      }
      setCandidateForm({ name: '', position: '', electionId: '', image: null })
      setImagePreview('')
      setShowModal(false)
      showMessage('Added', 'success')
    } catch (error) {
      showMessage(error.message || 'Failed to add', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete?')) return
    try {
      await apiRequest(`/candidates/${id}`, { method: 'DELETE' })
      setCandidates(prev => prev.filter(c => c._id !== id))
      showMessage('Deleted', 'success')
    } catch (error) {
      showMessage(error.message || 'Failed to delete', 'error')
    }
  }

  const openDetails = c => {
    setDisplayCandidate(c)
    setShowDetails(true)
  }

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedElection = elections.find(e => e._id === selectedElectionId)

  if (loading && selectedElectionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates Management</h1>
            <p className="text-gray-600 mt-1">Manage candidate registrations and profiles</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => selectedElectionId && fetchCandidates(selectedElectionId)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Refresh</button>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <Plus size={20}/>Add Candidate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type==='success'?'bg-green-50 text-green-800 border-green-200':'bg-red-50 text-red-800 border-red-200'}`}>
            {message.type==='success'?<CheckCircle size={20}/>:<XCircle size={20}/>}<span>{message.text}</span>
          </motion.div>
        )}

        <div className="mb-8">
          <select value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)} className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Choose an election</option>
            {elections.map(e => <option key={e._id} value={e._id}>{e.title} ({e.status})</option>)}
          </select>
        </div>

        {selectedElectionId && (
          <div className="mb-8 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"/>
          </div>
        )}

        {!selectedElectionId && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
            <p className="text-gray-500 text-lg">Select an election to view candidates</p>
          </div>
        )}

        {selectedElectionId && (
          <motion.div initial="hidden" animate="visible" variants={{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:0.1}}}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <motion.div key={c._id} variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg">
                <div className="aspect-w-16 aspect-h-12">
                  <img src={c.image} alt={c.name} className="w-full h-48 object-cover" onError={e=>e.target.src='https://via.placeholder.com/300x300/e5e7eb/6b7280?text=No+Image'}/>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="text-white" size={20}/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{c.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{c.position}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span className="text-gray-500">Votes:</span><span className="font-semibold text-green-600">{c.votes||0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="px-2 py-1 rounded-full text-xs font-medium">{selectedElection?.status}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Added:</span><span className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button onClick={()=>openDetails(c)} className="p-2 hover:bg-blue-50 rounded-lg"><Eye size={18}/></button>
                    <button className="p-2 hover:bg-green-50 rounded-lg"><Edit size={18}/></button>
                    <button onClick={()=>handleDelete(c._id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedElectionId && filtered.length===0 && !loading && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
            <p className="text-gray-500 text-lg">No candidates found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Candidate</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text" name="name" value={candidateForm.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                <input type="text" name="position" value={candidateForm.position} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Election *</label>
                <select name="electionId" value={candidateForm.electionId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Select an election</option>
                  {elections.filter(e=>e.status!=='completed').map(e=>(
                    <option key={e._id} value={e._1d}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} className="hidden"/>
                    <label htmlFor="imageInput" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
                      <p className="text-sm text-gray-600 mb-2">Click to upload</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border"/>
                    <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><X size={16}/></button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreateCandidate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isSubmitting?'Adding...':'Add Candidate'}</button>
            </div>
          </motion.div>
        </div>
      )}

       {showDetails && displayCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{opacity:0,scale:0.9}} 
              animate={{opacity:1,scale:1}} 
              exit={{opacity:0,scale:0.9}} 
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Candidate Details</h3>
                <button onClick={()=>setShowDetails(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <img src={displayCandidate.image} alt={displayCandidate.name} className="w-full h-48 object-cover rounded-lg"/>
                <h4 className="text-lg font-semibold">{displayCandidate.name}</h4>
                <p>Position: {displayCandidate.position}</p>
                <p>Votes: {displayCandidate.votes}</p>
                <p>Election: {selectedElection?.title}</p>
                <p>Added: {new Date(displayCandidate.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={()=>setShowDetails(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
   
  );
};

export default CandidatesPage;