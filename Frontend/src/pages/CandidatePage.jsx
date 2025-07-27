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
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchElections()
  }, [])

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId)
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
      const active = data.find(e => e.status === 'active' || e.status === 'upcoming')
      setSelectedElectionId(active ? active._id : data[0]?._id || '')
    } catch (err) {
      showMessage(err.message || 'Failed to fetch elections', 'error')
      setError(err)
    }
  }

  const fetchCandidates = async id => {
    setLoading(true)
    try {
      const data = await apiRequest(`/candidates/election/${id}`)
      setCandidates(data)
    } catch (err) {
      showMessage(err.message || 'Failed to fetch candidates', 'error')
      setCandidates([])
      setError(err)
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
    } catch (err) {
      showMessage(err.message || 'Failed to add', 'error')
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
    } catch (err) {
      showMessage(err.message || 'Failed to delete', 'error')
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
          <p className="text-gray-500 text-lg">An error occurred while loading the page.</p>
        </div>
      </div>
    )
  }

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
    <>
      {/* Full JSX content remains unchanged (you already have the rest of the JSX in your last code) */}
    </>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>An error occurred while rendering the component.</div>
    }

    return this.props.children
  }
}

export default function WrappedCandidatesPage() {
  return (
    <ErrorBoundary>
      <CandidatesPage />
    </ErrorBoundary>
  )
}
