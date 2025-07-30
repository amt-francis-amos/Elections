import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Filter,
  User,
  ChevronDown,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

const CandidateCard = ({ candidate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with candidate image and basic info */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full overflow-hidden flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            {candidate.image ? (
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <User size={32} className="text-white/80" style={{ display: candidate.image ? 'none' : 'flex' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{candidate.name}</h3>
            <p className="text-blue-100 font-medium">{candidate.position}</p>
            {candidate.electionTitle && (
              <p className="text-blue-200 text-sm mt-1">{candidate.electionTitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Candidate details */}
      <div className="p-6 space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          {candidate.email && (
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm break-all">{candidate.email}</span>
            </div>
          )}
          
          {candidate.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm">{candidate.phone}</span>
            </div>
          )}
          
          {(candidate.department || candidate.year) && (
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm">
                {candidate.department}
                {candidate.department && candidate.year && ' • '}
                {candidate.year}
              </span>
            </div>
          )}
        </div>

        {/* Bio section */}
        {candidate.bio && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User size={16} />
              About
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">{candidate.bio}</p>
          </div>
        )}

        {/* Vote count (if available) */}
        {typeof candidate.votes !== 'undefined' && (
          <div className="pt-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-green-600" />
                  <span className="font-medium text-gray-700">Current Votes</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{candidate.votes}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, value, onChange, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {value || label}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-600 border-b border-gray-100"
          >
            All {label}s
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Extract unique values for filters
  const elections = [...new Set(candidates.map(c => c.electionTitle).filter(Boolean))];
  const positions = [...new Set(candidates.map(c => c.position).filter(Boolean))];
  const departments = [...new Set(candidates.map(c => c.department).filter(Boolean))];

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the regular candidates endpoint with authentication
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/candidates`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        timeout: 15000
      });

      let candidatesData = [];

      if (response.data) {
        if (response.data.success === true) {
          candidatesData = response.data.candidates || response.data.data || [];
        } else if (Array.isArray(response.data)) {
          candidatesData = response.data;
        } else if (response.data.candidates && Array.isArray(response.data.candidates)) {
          candidatesData = response.data.candidates;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          candidatesData = response.data.data;
        }
      }

      // Ensure candidatesData is an array
      if (!Array.isArray(candidatesData)) {
        candidatesData = [];
      }

      setCandidates(candidatesData);

    } catch (error) {
      console.error('Error fetching candidates:', error);
      
      let errorMessage = 'Failed to load candidates';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please check your connection';
      } else if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = 'Authentication required - please log in to view candidates';
            break;
          case 403:
            errorMessage = 'Access denied - insufficient permissions';
            break;
          case 404:
            errorMessage = 'No candidates found or endpoint not available';
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
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter candidates based on search term and filters
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      candidate.name?.toLowerCase().includes(searchLower) ||
      candidate.position?.toLowerCase().includes(searchLower) ||
      candidate.electionTitle?.toLowerCase().includes(searchLower) ||
      candidate.department?.toLowerCase().includes(searchLower) ||
      candidate.bio?.toLowerCase().includes(searchLower)
    );

    const matchesElection = !selectedElection || candidate.electionTitle === selectedElection;
    const matchesPosition = !selectedPosition || candidate.position === selectedPosition;
    const matchesDepartment = !selectedDepartment || candidate.department === selectedDepartment;

    return matchesSearch && matchesElection && matchesPosition && matchesDepartment;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedElection('');
    setSelectedPosition('');
    setSelectedDepartment('');
  };

  const hasActiveFilters = searchTerm || selectedElection || selectedPosition || selectedDepartment;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">Loading Candidates</h3>
          <p className="text-gray-500">Please wait while we fetch the candidate information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">Unable to Load Candidates</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchCandidates}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet the Candidates</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get to know the candidates running for various positions. Learn about their backgrounds, 
              qualifications, and vision for representing you.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates by name, position, department, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              {elections.length > 0 && (
                <FilterDropdown
                  label="Election"
                  value={selectedElection}
                  onChange={setSelectedElection}
                  options={elections}
                  icon={Calendar}
                />
              )}
              
              {positions.length > 0 && (
                <FilterDropdown
                  label="Position"
                  value={selectedPosition}
                  onChange={setSelectedPosition}
                  options={positions}
                  icon={Award}
                />
              )}
              
              {departments.length > 0 && (
                <FilterDropdown
                  label="Department"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={departments}
                  icon={MapPin}
                />
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500">
              Showing {filteredCandidates.length} of {candidates.length} candidates
              {hasActiveFilters && ' (filtered)'}
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16">
            <Users size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No candidates match your criteria' : 'No candidates available'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? 'Try adjusting your search terms or filters to find candidates.'
                : 'There are currently no candidates registered for any elections.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id || candidate._id}
                candidate={candidate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            Make sure to research each candidate thoroughly before casting your vote.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;