import React, { useState, useRef } from 'react';
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
  CheckCircle
} from 'lucide-react';

const ImageUploadModal = ({ isOpen, onClose, onImageSelect, currentImage = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [preview, setPreview] = useState(currentImage);
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

    setUploadStatus({ type: 'success', message: 'Image uploaded successfully!' });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreview(imageUrl);
      onImageSelect(imageUrl, file);
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
    setUploadStatus(null);
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Candidate Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
              <button
                onClick={removeImage}
                className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
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
                    className="text-blue-600 hover:text-blue-500"
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
            className="hidden"
          />

          {uploadStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus.type === 'error' 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {uploadStatus.type === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!preview}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};

const CandidateCard = ({ candidate, onEdit, onDelete, onImageUpload }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const handleImageSelect = (imageUrl, file) => {
    onImageUpload(candidate.id, imageUrl, file);
    setShowImageModal(false);
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
                />
              ) : (
                <Users size={24} className="text-gray-400" />
              )}
            </div>
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
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
              onClick={() => onDelete(candidate.id)}
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={14} />
              <span className="truncate">{candidate.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} />
              <span>{candidate.phone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{candidate.department} • {candidate.year}</span>
            </div>
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
  onImageUpload 
}) => {
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return candidate.name?.toLowerCase().includes(searchLower) ||
           candidate.position?.toLowerCase().includes(searchLower) ||
           candidate.electionTitle?.toLowerCase().includes(searchLower) ||
           candidate.department?.toLowerCase().includes(searchLower);
  });

  const handleImageUpload = (candidateId, imageUrl, file) => {
    // In a real application, you would upload the file to your server/cloud storage
    // and get back a permanent URL. For now, we'll use the data URL.
    
    if (onImageUpload) {
      onImageUpload(candidateId, imageUrl, file);
    }
    
    // You might want to show a success notification here
    console.log('Image uploaded for candidate:', candidateId);
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
          onClick={() => openModal('addCandidate')}
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
              {filteredCandidates.length} of {candidates.length} candidates
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
                  onClick={() => openModal('addCandidate')}
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
                  key={candidate.id}
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
    </div>
  );
};

export default Candidates;