import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Trophy,
  Info,
  ThumbsUp
} from 'lucide-react';

const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const CandidateCard = ({ candidate, onVote, isVoting, hasVoted, votedForThis, electionTitle }) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={!hasVoted ? "hover" : {}}
      whileTap={!hasVoted ? "tap" : {}}
      className={`
        relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300
        ${votedForThis ? 'border-green-500 ring-4 ring-green-200' : 'border-gray-200 hover:border-blue-300'}
        ${hasVoted && !votedForThis ? 'opacity-60' : ''}
      `}
    >
      {/* Voted Badge */}
      {votedForThis && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4 z-10 bg-green-500 text-white rounded-full p-2 shadow-lg"
        >
          <CheckCircle size={20} />
        </motion.div>
      )}

      {/* Candidate Image */}
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50">
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
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ display: candidate.image ? 'none' : 'flex' }}
        >
          <div className="bg-white rounded-full p-6 shadow-lg">
            <User size={48} className="text-gray-400" />
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Candidate Info */}
      <div className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
          <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {candidate.position}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {candidate.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={14} className="text-blue-500" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          
          {candidate.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} className="text-green-500" />
              <span>{candidate.phone}</span>
            </div>
          )}
          
          {candidate.department && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={14} className="text-purple-500" />
              <span>{candidate.department} {candidate.year && `• ${candidate.year}`}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {candidate.bio.length > 100 
                ? `${candidate.bio.substring(0, 100)}...` 
                : candidate.bio
              }
            </p>
          </div>
        )}

        {/* Vote Count */}
        <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <Trophy size={16} className="text-yellow-500" />
          <span className="font-semibold text-gray-700">
            {candidate.votes || 0} votes
          </span>
        </div>

        {/* Vote Button */}
        <div className="pt-2">
          {hasVoted ? (
            votedForThis ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-center flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Your Vote
              </motion.div>
            ) : (
              <div className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-medium text-center">
                Vote Cast
              </div>
            )
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVote(candidate)}
              disabled={isVoting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
            >
              {isVoting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Casting Vote...
                </>
              ) : (
                <>
                  <ThumbsUp size={18} />
                  Vote for {candidate.name}
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ElectionHeader = ({ election, candidatesCount, hasVoted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200"
    >
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {election.title}
        </h1>
        <p className="text-gray-600 text-lg">
          {election.description || 'Choose your preferred candidate'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-4">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{candidatesCount}</div>
          <div className="text-sm text-blue-700">Candidates</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-sm text-green-700">Election Period</div>
          <div className="text-sm font-medium text-green-900">
            {election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Active'}
            {election.endDate && ` - ${new Date(election.endDate).toLocaleDateString()}`}
          </div>
        </div>

        <div className={`rounded-xl p-4 ${hasVoted ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {hasVoted ? (
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          ) : (
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          )}
          <div className={`text-2xl font-bold ${hasVoted ? 'text-green-900' : 'text-yellow-900'}`}>
            {hasVoted ? 'Voted' : 'Pending'}
          </div>
          <div className={`text-sm ${hasVoted ? 'text-green-700' : 'text-yellow-700'}`}>
            Your Status
          </div>
        </div>
      </div>

      {hasVoted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-green-800">Thank you for voting!</p>
            <p className="text-sm text-green-700">Your vote has been successfully recorded.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const Vote = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  // Check for existing vote
  const checkExistingVote = async (electionId) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const { data } = await axios.get(
        `${API_BASE_URL}/votes/${electionId}/user-vote`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.vote) {
        setVotedCandidateId(data.vote.candidate);
        setHasVoted(true);
      } else {
        setVotedCandidateId(null);
        setHasVoted(false);
      }
    } catch (err) {
      // If 404, user hasn't voted yet
      if (err.response?.status === 404) {
        setVotedCandidateId(null);
        setHasVoted(false);
      }
    }
  };

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setError('');
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Please log in to view elections.');
          return;
        }

        const { data } = await axios.get(
          `${API_BASE_URL}/elections`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Elections API Response:', data);
        
        let electionsArray = [];
        if (data && Array.isArray(data.elections)) {
          // Response format: { elections: [...], message: "..." }
          electionsArray = data.elections;
        } else if (data && data.success && Array.isArray(data.elections)) {
          // Response format: { success: true, elections: [...] }
          electionsArray = data.elections;
        } else if (Array.isArray(data)) {
          // Response is directly an array
          electionsArray = data;
        } else {
          console.error('Unexpected response format:', data);
          setError('Unexpected response format from server.');
          return;
        }

        const active = electionsArray.filter(e => e.isActive === true || e.status === 'active');
        setElections(active);
        
        if (active.length) {
          setSelectedElectionId(active[0]._id);
          setSelectedElection(active[0]);
        }
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections.');
      }
    };
    
    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchCandidates = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return;
        }

        console.log('Fetching candidates for election ID:', selectedElectionId);
        
        // Use the correct backend route: /api/candidates/election/:electionId
        let response;
        try {
          response = await axios.get(
            `${API_BASE_URL}/candidates/election/${selectedElectionId}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            }
          );
        } catch (firstError) {
          // If we get a 403 (Forbidden) error, it might be due to admin role requirement
          if (firstError.response?.status === 403) {
            console.warn('Access denied to candidates endpoint. You may need admin privileges or a public voting endpoint.');
            setError('Access denied. This may require admin privileges. Please contact your administrator.');
            return;
          }
          throw firstError;
        }
        const data = response.data;
        
        console.log('Candidates API Response:', data);
        
        let candidatesArray = [];
        if (data && Array.isArray(data.candidates)) {
          // Response format: { candidates: [...], message: "..." }
          candidatesArray = data.candidates;
        } else if (data && data.success && Array.isArray(data.candidates)) {
          // Response format: { success: true, candidates: [...] }
          candidatesArray = data.candidates;
        } else if (Array.isArray(data)) {
          // Response is directly an array
          candidatesArray = data;
        } else {
          console.error('Unexpected candidates response format:', data);
          candidatesArray = [];
        }
        
        console.log('Processed candidates:', candidatesArray);
        setCandidates(candidatesArray);
        await checkExistingVote(selectedElectionId);
        
      } catch (err) {
        console.error('Error loading candidates:', err);
        
        let errorMessage = 'Failed to load candidates.';
        
        if (err.response) {
          const status = err.response.status;
          switch (status) {
            case 404:
              errorMessage = 'Candidates endpoint not found. Please check your backend routes.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please log in again.';
              break;
            case 403:
              errorMessage = 'Access denied. You may not have permission to view candidates.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Server returned ${status} error: ${err.response.data?.message || 'Unknown error'}`;
          }
        } else if (err.request) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedElectionId]);

  const handleElectionChange = (electionId) => {
    const election = elections.find(e => e._id === electionId);
    setSelectedElectionId(electionId);
    setSelectedElection(election);
    setVotedCandidateId(null);
    setHasVoted(false);
  };

  const handleVote = async (candidate) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Please log in first to vote.');
      return;
    }

    if (hasVoted) {
      setError('You have already voted in this election.');
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE_URL}/votes`,
        { electionId: selectedElectionId, candidateId: candidate._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setVotedCandidateId(candidate._id);
      setHasVoted(true);
      
      // Update vote count optimistically
      setCandidates(prev => 
        prev.map(c => 
          c._id === candidate._id 
            ? { ...c, votes: (c.votes || 0) + 1 }
            : c
        )
      );

    } catch (err) {
      console.error('Error casting vote:', err);
      const message = err.response?.data?.message || 'Something went wrong while voting.';
      setError(message);
    } finally {
      setIsVoting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
          >
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Election Selection */}
        {elections.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-md mx-auto"
          >
            <label className="block mb-2 font-medium text-gray-700 text-center">
              Select Election
            </label>
            <select
              value={selectedElectionId}
              onChange={e => handleElectionChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {elections.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Election Header */}
        {selectedElection && (
          <ElectionHeader 
            election={selectedElection} 
            candidatesCount={candidates.length}
            hasVoted={hasVoted}
          />
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Loading candidates...</p>
          </motion.div>
        )}

        {/* No Elections */}
        {!loading && elections.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Active Elections
            </h3>
            <p className="text-gray-600">
              There are currently no active elections available for voting.
            </p>
          </motion.div>
        )}

        {/* No Candidates */}
        {!loading && candidates.length === 0 && selectedElectionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Candidates Found
            </h3>
            <p className="text-gray-600">
              No candidates have been registered for this election yet.
            </p>
          </motion.div>
        )}

        {/* Candidates Grid */}
        {!loading && candidates.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  onVote={handleVote}
                  isVoting={isVoting}
                  hasVoted={hasVoted}
                  votedForThis={votedCandidateId === candidate._id}
                  electionTitle={selectedElection?.title}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Voting Instructions */}
        {!hasVoted && candidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Voting Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Review all candidates carefully before making your choice</li>
                  <li>• You can only vote once per election</li>
                  <li>• Your vote is anonymous and secure</li>
                  <li>• Click the "Vote" button to cast your ballot</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Vote;