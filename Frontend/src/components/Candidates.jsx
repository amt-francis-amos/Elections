import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Edit,
  UserMinus,
  Users,
  Mail,
  Phone,
  MapPin,
  Upload,
  X,
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2,
  User
} from 'lucide-react';
import axios from 'axios';

// Define API_BASE_URL constant
const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

const AddCandidateModal = ({ isOpen, onClose, onCandidateAdded, elections = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    electionId: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    bio: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingElections, setLoadingElections] = useState(false);
  const [availableElections, setAvailableElections] = useState(elections);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const makeRequest = async (url, config, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await axios.get(url, {
          ...config,
          timeout: 10000
        });
        return response;
      } catch (error) {
        if (i === retries) throw error;
        
       
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  useEffect(() => {
    const fetchElections = async () => {
      if (isOpen && (!elections || elections.length === 0)) {
        setLoadingElections(true);
        setErrors(prev => ({ ...prev, elections: '' }));
        
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('No authentication token found');
          }

        
          const response = await makeRequest(
            `${API_BASE_URL}/elections`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Elections API Response:', response.data);
          
          let electionsData = [];
          
         
          if (response.data) {
            if (response.data.success === true) {
              electionsData = response.data.elections || response.data.data || [];
            } else if (Array.isArray(response.data)) {
              electionsData = response.data;
            } else if (response.data.elections && Array.isArray(response.data.elections)) {
              electionsData = response.data.elections;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              electionsData = response.data.data;
            } else if (response.data.title || response.data.name) {
              electionsData = [response.data];
            }
          }
          
          // Ensure electionsData is an array
          if (!Array.isArray(electionsData)) {
            electionsData = [];
          }
          
          electionsData = electionsData.filter(election => 
            election && (election._id || election.id) && (election.title || election.name)
          );
          
          console.log('Processed elections data:', electionsData);
          
          setAvailableElections(electionsData);
          
          if (electionsData.length === 0) {
            setErrors(prev => ({ 
              ...prev, 
              elections: 'No active elections found. Please create an election first.' 
            }));
          }
          
        } catch (error) {
          console.error('Error fetching elections:', error);
          
          let errorMessage = 'Failed to load elections';
          
          if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout - please try again';
          } else if (error.response) {
            const status = error.response.status;
            switch (status) {
              case 401:
                errorMessage = 'Authentication failed - please login again';
                break;
              case 403:
                errorMessage = 'Access denied - insufficient permissions';
                break;
              case 404:
                errorMessage = 'Elections endpoint not found';
                break;
              case 429:
                errorMessage = 'Too many requests - please wait a moment';
                break;
              case 500:
              case 502:
              case 503:
                errorMessage = 'Server error - please try again later';
                break;
              default:
                errorMessage = error.response.data?.message || `Server returned ${status} error`;
            }
          } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setErrors(prev => ({ ...prev, elections: errorMessage }));
          setAvailableElections([]);
        } finally {
          setLoadingElections(false);
        }
      } else if (elections && elections.length > 0) {
        setAvailableElections(elections);
        setErrors(prev => ({ ...prev, elections: '' }));
      }
    };

    fetchElections();
  }, [isOpen, elections]);

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      electionId: '',
      email: '',
      phone: '',
      department: '',
      year: '',
      bio: ''
    });
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.electionId) newErrors.electionId = 'Please select an election';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (image) {
        formDataToSend.append('image', image);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/candidates`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onCandidateAdded(response.data.candidate);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add candidate';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const retryFetchElections = () => {
    setAvailableElections([]);
    // This will trigger the useEffect to refetch
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Candidate</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Upload */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              >
                <Camera size={14} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.image && (
              <p className="text-red-600 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter candidate name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., President, Vice President"
              />
              {errors.position && (
                <p className="text-red-600 text-sm mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Election <span className="text-red-500">*</span>
            </label>
            {loadingElections ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm text-gray-500">Loading elections...</span>
              </div>
            ) : (
              <select
                name="electionId"
                value={formData.electionId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.electionId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an election</option>
                {availableElections.map(election => (
                  <option key={election._id || election.id} value={election._id || election.id}>
                    {election.title || election.name} 
                    {election.status && ` (${election.status})`}
                    {election.startDate && ` - ${new Date(election.startDate).toLocaleDateString()}`}
                  </option>
                ))}
              </select>
            )}
            {errors.electionId && (
              <p className="text-red-600 text-sm mt-1">{errors.electionId}</p>
            )}
            {errors.elections && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errors.elections}</p>
                </div>
                <button
                  type="button"
                  onClick={retryFetchElections}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="candidate@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2024, Senior"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description about the candidate..."
            />
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingElections}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Candidate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImageUploadModal = ({ isOpen, onClose, onImageSelect, currentImage = null, candidateId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [preview, setPreview] = useState(currentImage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }
    
    return null;
  };

  const handleFile = (file) => {
    const error = validateFile(file);
    if (error) {
      setUploadStatus({ type: 'error', message: error });
      return;
    }

    setUploadStatus({ type: 'success', message: 'Image selected successfully!' });
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading image...' });

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/candidates/${candidateId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onImageSelect(candidateId, response.data.imageUrl || response.data.image);
        setUploadStatus({ type: 'success', message: 'Image uploaded successfully!' });
        
        setTimeout(() => {
          onClose();
          resetModal();
        }, 1500);
      }

    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      setUploadStatus({ type: 'error', message: errorMessage });
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setPreview(currentImage);
    setSelectedFile(null);
    setUploadStatus(null);
    setDragActive(false);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Candidate Photo</h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {preview ? (
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {!uploading && (
                <button
                  onClick={removeImage}
                  className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Drop your image here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPEG, PNG, WebP (max 5MB)
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          {uploadStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus.type === 'error' 
                ? 'bg-red-50 text-red-700' 
                : uploadStatus.type === 'info'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {uploadStatus.type === 'error' ? (
                <AlertCircle size={16} />
              ) : uploadStatus.type === 'info' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Save Photo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CandidateCard = ({ candidate, onEdit, onDelete, onImageUpload }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const handleImageSelect = (candidateId, imageUrl) => {
    onImageUpload(candidateId, imageUrl);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${candidate.name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/candidates/${candidate.id || candidate._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        onDelete(candidate.id || candidate._id);
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="relative group">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {candidate.image ? (
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/64/64';
                  }}
                />
              ) : (
                <Users size={24} className="text-gray-400" />
              )}
            </div>
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Upload photo"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(candidate)}
              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
              title="Edit candidate"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
              title="Delete candidate"
            >
              <UserMinus size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{candidate.name}</h3>
            <p className="text-sm text-blue-600 font-medium">{candidate.position}</p>
            <p className="text-sm text-gray-600">{candidate.electionTitle}</p>
          </div>
          
          <div className="space-y-2">
            {candidate.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={14} />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            
            {candidate.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={14} />
                <span>{candidate.phone}</span>
              </div>
            )}
            
            {candidate.department && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} />
                <span>{candidate.department} {candidate.year && `• ${candidate.year}`}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Votes Received</span>
              <span className="text-lg font-bold text-blue-600">{candidate.votes || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageSelect={handleImageSelect}
        currentImage={candidate.image}
        candidateId={candidate.id || candidate._id}
      />
    </>
  );
};

const Candidates = ({ 
  candidates, 
  searchTerm, 
  setSearchTerm, 
  openModal, 
  handleDeleteCandidate,
  onImageUpload,
  elections = [] 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [candidatesList, setCandidatesList] = useState(candidates);
  const [availableElections, setAvailableElections] = useState(elections);

  useEffect(() => {
    setCandidatesList(candidates);
  }, [candidates]);

  useEffect(() => {
    if (elections && elections.length > 0) {
      setAvailableElections(elections);
    }
  }, [elections]);

  const filteredCandidates = candidatesList.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return candidate.name?.toLowerCase().includes(searchLower) ||
           candidate.position?.toLowerCase().includes(searchLower) ||
           candidate.electionTitle?.toLowerCase().includes(searchLower) ||
           candidate.department?.toLowerCase().includes(searchLower);
  });

  const handleCandidateAdded = (newCandidate) => {
    setCandidatesList(prev => [newCandidate, ...prev]);
  };

  const handleImageUpload = (candidateId, imageUrl) => {
    setCandidatesList(prev => 
      prev.map(candidate => 
        (candidate.id || candidate._id) === candidateId 
          ? { ...candidate, image: imageUrl }
          : candidate
      )
    );
    if (onImageUpload) {
      onImageUpload(candidateId, imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidates Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage candidates and their information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates by name, position, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredCandidates.length} of {candidatesList.length} candidates
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No candidates found' : 'No candidates yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first candidate to get started'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <UserPlus size={20} />
                  Add First Candidate
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id || candidate._id}
                  candidate={candidate}
                  onEdit={(candidate) => openModal('editCandidate', candidate)}
                  onDelete={handleDeleteCandidate}
                  onImageUpload={handleImageUpload}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCandidateAdded={handleCandidateAdded}
        elections={availableElections}
      />
    </div>
  );
};

export default Candidates;