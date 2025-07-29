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
    y: -3,
    scale: 1.01,
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
        relative bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border transition-all duration-300
        ${votedForThis ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200 hover:border-blue-300'}
        ${hasVoted && !votedForThis ? 'opacity-60' : ''}
      `}
    >
      {/* Voted Badge */}
      {votedForThis && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1.5 shadow-lg"
        >
          <CheckCircle size={16} />
        </motion.div>
      )}

      <div className="p-5">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {candidate.image ? (
              <img 
                src={candidate.image} 
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center border-2 border-gray-100"
              style={{ display: candidate.image ? 'none' : 'flex' }}
            >
              <User size={24} className="text-gray-400" />
            </div>
          </div>

          {/* Name and Position */}
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {candidate.name}
            </h3>
            <div className="inline-block bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium mb-2">
              {candidate.position}
            </div>
            
            {/* Vote Count */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Trophy size={14} className="text-yellow-500" />
              <span className="font-medium">{candidate.votes || 0} votes</span>
            </div>
          </div>
        </div>

        {/* Contact Info - Compact */}
        <div className="space-y-1.5 mb-4 text-sm">
          {candidate.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={12} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          
          {candidate.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={12} className="text-green-500 flex-shrink-0" />
              <span>{candidate.phone}</span>
            </div>
          )}
          
          {candidate.department && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={12} className="text-purple-500 flex-shrink-0" />
              <span className="truncate">
                {candidate.department} {candidate.year && `• ${candidate.year}`}
              </span>
            </div>
          )}
        </div>

        {/* Bio - Condensed */}
        {candidate.bio && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
              {candidate.bio.length > 80 
                ? `${candidate.bio.substring(0, 80)}...` 
                : candidate.bio
              }
            </p>
          </div>
        )}

        {/* Vote Button */}
        <div className="mt-auto">
          {hasVoted ? (
            votedForThis ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle size={16} />
                Your Vote
              </motion.div>
            ) : (
              <div className="w-full py-2.5 bg-gray-200 text-gray-500 rounded-lg font-medium text-center text-sm">
                Vote Cast
              </div>
            )
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onVote(candidate)}
              disabled={isVoting}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:shadow-none text-sm"
            >
              {isVoting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Voting...
                </>
              ) : (
                <>
                  <ThumbsUp size={16} />
                  Vote
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
      className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {election.title}
        </h1>
        <p className="text-gray-600">
          {election.description || 'Choose your preferred candidate'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-4">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-900">{candidatesCount}</div>
          <div className="text-sm text-blue-700">Candidates</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm text-green-700 mb-1">Election Period</div>
          <div className="text-xs font-medium text-green-900">
            {election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Active'}
            {election.endDate && ` - ${new Date(election.endDate).toLocaleDateString()}`}
          </div>
        </div>

        <div className={`rounded-xl p-4 ${hasVoted ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {hasVoted ? (
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          )}
          <div className={`text-xl font-bold ${hasVoted ? 'text-green-900' : 'text-yellow-900'}`}>
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
          <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium text-green-800">Thank you for voting!</p>
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
        
        // Try multiple endpoints with fallback strategy
        let response;
        let successfulEndpoint = '';
        
        // List of possible endpoints to try (add your public voting endpoint here when ready)
        const candidateEndpoints = [
          // Primary: Public voting endpoint (when you implement it)
          `${API_BASE_URL}/voting/candidates/${selectedElectionId}`,
          `${API_BASE_URL}/candidates/voting/${selectedElectionId}`,
          // Fallback: Existing admin endpoint
          `${API_BASE_URL}/candidates/election/${selectedElectionId}`,
          // Additional fallbacks
          `${API_BASE_URL}/candidates?electionId=${selectedElectionId}`,
          `${API_BASE_URL}/public/candidates/${selectedElectionId}`
        ];

        let lastError = null;
        
        for (const endpoint of candidateEndpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            response = await axios.get(endpoint, { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            });
            successfulEndpoint = endpoint;
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break; // Success, exit loop
          } catch (error) {
            console.log(`❌ Failed endpoint: ${endpoint}`, error.response?.status, error.response?.data?.message);
            lastError = error;
            
            // If it's a 403 error with role-based message, continue trying other endpoints
            if (error.response?.status === 403 && error.response?.data?.message?.includes('Required roles: admin')) {
              console.log('Admin role required, trying next endpoint...');
              continue;
            }
            
            // For other types of errors, continue trying
            continue;
          }
        }

        // If no endpoint worked, throw the last error
        if (!response) {
          console.error('All candidate endpoints failed');
          throw lastError || new Error('All candidate endpoints failed');
        }

        const data = response.data;
        console.log('Candidates API Response:', data);
        console.log('Successful endpoint:', successfulEndpoint);
        
        let candidatesArray = [];
        if (data && Array.isArray(data.candidates)) {
          candidatesArray = data.candidates;
        } else if (data && data.success && Array.isArray(data.candidates)) {
          candidatesArray = data.candidates;
        } else if (Array.isArray(data)) {
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
          const responseData = err.response.data;
          
          switch (status) {
            case 404:
              errorMessage = 'No candidates found for this election or endpoint not available.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please log in again.';
              break;
            case 403:
              if (responseData?.message?.includes('Required roles: admin')) {
                errorMessage = 'This appears to be an admin-only endpoint. A public voting endpoint needs to be implemented on the backend. Please contact your administrator.';
              } else {
                errorMessage = 'Access denied. You may not have permission to view candidates.';
              }
              break;
            case 400:
              if (responseData?.message?.includes('not currently active')) {
                errorMessage = 'This election is not currently active for voting.';
              } else {
                errorMessage = responseData?.message || 'Invalid request.';
              }
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = responseData?.message || `Server returned ${status} error`;
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
            className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
          >
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <div className="mt-6 text-sm text-red-600">
              <p><strong>Debug Info:</strong> The system tried multiple endpoints but couldn't access candidate data.</p>
              <p>Check the browser console (F12) for detailed error logs.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Voting Instructions</h4>
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