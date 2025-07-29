import React, { useState, useEffect } from 'react';
import {
  Vote,
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Trophy,
  Clock,
  X
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';


const VoteConfirmationModal = ({ isOpen, onClose, candidate, onConfirm, loading }) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Your Vote</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
              {candidate.image ? (
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
            </div>
            <h4 className="text-xl font-semibold text-gray-900">{candidate.name}</h4>
            <p className="text-blue-600 font-medium">{candidate.position}</p>
            <p className="text-sm text-gray-600">{candidate.electionTitle}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Important Notice</h5>
                <p className="text-sm text-yellow-700">
                  Once you cast your vote, it cannot be changed. Please make sure you want to vote for this candidate.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Are you sure you want to vote for <strong>{candidate.name}</strong> for <strong>{candidate.position}</strong>?
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Voting...
              </>
            ) : (
              <>
                <Vote size={16} />
                Confirm Vote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Vote Cast Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your vote for <strong>{candidate.name}</strong> has been recorded.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for participating in this election!
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual Candidate Card
const CandidateVotingCard = ({ candidate, onVote, hasVoted, userVotedFor, electionStatus }) => {
  const isVotedFor = userVotedFor === candidate._id || userVotedFor === candidate.id;
  const canVote = electionStatus === 'active' && !hasVoted;

  return (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white ${
      isVotedFor ? 'ring-2 ring-green-500 bg-green-50' : ''
    }`}>
      {isVotedFor && (
        <div className="flex items-center gap-2 mb-4 text-green-700">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">You voted for this candidate</span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
            <div className="w-full h-full flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{candidate.name}</h3>
          <p className="text-blue-600 font-medium mb-1">{candidate.position}</p>
          <p className="text-sm text-gray-600">{candidate.electionTitle}</p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-blue-600">
            <Trophy size={16} />
            <span className="font-semibold">{candidate.votes || 0}</span>
          </div>
          <p className="text-xs text-gray-500">votes</p>
        </div>
      </div>

      {/* Candidate Details */}
      <div className="space-y-2 mb-4">
        {candidate.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <span className="truncate">{candidate.email}</span>
          </div>
        )}
        
        {candidate.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} />
            <span>{candidate.phone}</span>
          </div>
        )}
        
        {candidate.department && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{candidate.department} {candidate.year && `• ${candidate.year}`}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {candidate.bio && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">{candidate.bio}</p>
        </div>
      )}

      {/* Vote Button */}
      <div className="pt-4 border-t border-gray-200">
        {electionStatus !== 'active' ? (
          <div className="flex items-center justify-center gap-2 text-gray-500 py-2">
            <Clock size={16} />
            <span className="text-sm">
              {electionStatus === 'upcoming' ? 'Election not started' : 'Election ended'}
            </span>
          </div>
        ) : hasVoted ? (
          <div className="flex items-center justify-center gap-2 text-green-600 py-2">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">
              {isVotedFor ? 'You voted for this candidate' : 'You have already voted'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onVote(candidate)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Vote size={18} />
            Vote for {candidate.name}
          </button>
        )}
      </div>
    </div>
  );
};

// Main Candidates Page Component
const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [error, setError] = useState('');

  // Fetch elections and candidates
  useEffect(() => {
    fetchElectionsAndCandidates();
    fetchUserVotes();
  }, []);

  const fetchElectionsAndCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view candidates');
        return;
      }

      // Fetch elections
      const electionsResponse = await axios.get(`${API_BASE_URL}/elections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let electionsData = [];
      if (electionsResponse.data) {
        if (Array.isArray(electionsResponse.data)) {
          electionsData = electionsResponse.data;
        } else if (electionsResponse.data.elections) {
          electionsData = electionsResponse.data.elections;
        } else if (electionsResponse.data.data) {
          electionsData = electionsResponse.data.data;
        }
      }

      setElections(electionsData);

      // Fetch all candidates
      const candidatesPromises = electionsData.map(election =>
        axios.get(`${API_BASE_URL}/candidates/election/${election._id || election.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(error => {
          console.error(`Error fetching candidates for election ${election._id || election.id}:`, error);
          return { data: [] };
        })
      );

      const candidatesResponses = await Promise.all(candidatesPromises);
      
      let allCandidates = [];
      candidatesResponses.forEach((response, index) => {
        const election = electionsData[index];
        let candidatesData = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            candidatesData = response.data;
          } else if (response.data.candidates) {
            candidatesData = response.data.candidates;
          } else if (response.data.data) {
            candidatesData = response.data.data;
          }
        }

        // Add election info to each candidate
        const candidatesWithElection = candidatesData.map(candidate => ({
          ...candidate,
          electionId: election._id || election.id,
          electionTitle: election.title || election.name,
          electionStatus: election.status,
          electionStartDate: election.startDate,
          electionEndDate: election.endDate
        }));

        allCandidates = [...allCandidates, ...candidatesWithElection];
      });

      setCandidates(allCandidates);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/votes/user-votes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.votes) {
        const votesMap = {};
        response.data.votes.forEach(vote => {
          votesMap[vote.electionId] = vote.candidateId;
        });
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = (candidate) => {
    setSelectedCandidate(candidate);
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;

    setVoting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/votes`,
        {
          candidateId: selectedCandidate._id || selectedCandidate.id,
          electionId: selectedCandidate.electionId
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update user votes
        setUserVotes(prev => ({
          ...prev,
          [selectedCandidate.electionId]: selectedCandidate._id || selectedCandidate.id
        }));

        // Update candidate vote count
        setCandidates(prev =>
          prev.map(candidate =>
            (candidate._id || candidate.id) === (selectedCandidate._id || selectedCandidate.id)
              ? { ...candidate, votes: (candidate.votes || 0) + 1 }
              : candidate
          )
        );

        setShowConfirmModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error voting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cast vote. Please try again.';
      alert(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesElection = !selectedElection || candidate.electionId === selectedElection;
    const matchesPosition = !selectedPosition || candidate.position?.toLowerCase().includes(selectedPosition.toLowerCase());

    return matchesSearch && matchesElection && matchesPosition;
  });

  // Get unique positions for filter
  const uniquePositions = [...new Set(candidates.map(c => c.position).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchElectionsAndCandidates}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote for Your Candidates</h1>
          <p className="text-gray-600">Choose your preferred candidates for each position</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Elections</option>
              {elections.map(election => (
                <option key={election._id || election.id} value={election._id || election.id}>
                  {election.title || election.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Positions</option>
              {uniquePositions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedElection || selectedPosition
                ? 'Try adjusting your filters'
                : 'No candidates have been added yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <CandidateVotingCard
                key={candidate._id || candidate.id}
                candidate={candidate}
                onVote={handleVote}
                hasVoted={userVotes.hasOwnProperty(candidate.electionId)}
                userVotedFor={userVotes[candidate.electionId]}
                electionStatus={candidate.electionStatus}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <VoteConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          candidate={selectedCandidate}
          onConfirm={confirmVote}
          loading={voting}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
        />
      </div>
    </div>
  );
};

export default CandidatesPage;