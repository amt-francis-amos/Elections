import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  ThumbsUp,
  Shield
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

const CandidateCard = ({ candidate, onVote, isVoting, hasVoted, votedForThis, electionTitle, userRole }) => {
  const isAdminUser = userRole === 'admin';
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={!hasVoted && !isAdminUser ? "hover" : {}}
      whileTap={!hasVoted && !isAdminUser ? "tap" : {}}
      className={`
        relative bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border transition-all duration-300
        ${votedForThis ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200 hover:border-blue-300'}
        ${hasVoted && !votedForThis ? 'opacity-60' : ''}
        ${isAdminUser ? 'border-orange-200 bg-orange-50' : ''}
      `}
    >
      {/* Admin indicator */}
      {isAdminUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-3 left-3 z-10 bg-orange-500 text-white rounded-full p-1.5 shadow-lg"
        >
          <Shield size={16} />
        </motion.div>
      )}
  
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
        <div className="flex items-start gap-4 mb-4">
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

          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {candidate.name}
            </h3>
            <div className="inline-block bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium mb-2">
              {candidate.position}
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Trophy size={14} className="text-yellow-500" />
              <span className="font-medium">{candidate.votes || 0} votes</span>
            </div>
          </div>
        </div>

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

        <div className="mt-auto">
          {isAdminUser ? (
            <div className="w-full py-2.5 bg-orange-200 text-orange-700 rounded-lg font-medium text-center text-sm flex items-center justify-center gap-2">
              <Shield size={16} />
              Admin View Only
            </div>
          ) : hasVoted ? (
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

const ElectionHeader = ({ election, candidatesCount, hasVoted, userRole }) => {
  const isAdminUser = userRole === 'admin';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200"
    >
      {isAdminUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-orange-100 border border-orange-300 rounded-xl p-4 flex items-center gap-3"
        >
          <Shield className="text-orange-600 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium text-orange-800">Administrator View</p>
            <p className="text-sm text-orange-700">You are viewing this election as an administrator. Voting is restricted for admin accounts.</p>
          </div>
        </motion.div>
      )}

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

        <div className={`rounded-xl p-4 ${
          isAdminUser ? 'bg-orange-50' : hasVoted ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          {isAdminUser ? (
            <Shield className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          ) : hasVoted ? (
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          )}
          <div className={`text-xl font-bold ${
            isAdminUser ? 'text-orange-900' : hasVoted ? 'text-green-900' : 'text-yellow-900'
          }`}>
            {isAdminUser ? 'Admin' : hasVoted ? 'Voted' : 'Pending'}
          </div>
          <div className={`text-sm ${
            isAdminUser ? 'text-orange-700' : hasVoted ? 'text-green-700' : 'text-yellow-700'
          }`}>
            Your Status
          </div>
        </div>
      </div>

      {hasVoted && !isAdminUser && (
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
  const [userRole, setUserRole] = useState(null);

  // Check user role when component mounts
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload.role);
          console.log('User role detected:', payload.role);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };
    
    checkUserRole();
  }, []);

  const checkExistingVote = async (electionId) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      console.log('Checking existing vote for election:', electionId);

      let response;
      try {
        response = await axios.get(
          `${API_BASE_URL}/votes/${electionId}/user-vote`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (firstError) {
        if (firstError.response?.status === 404) {
          try {
            response = await axios.get(
              `${API_BASE_URL}/votes/user/${electionId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (secondError) {
            if (secondError.response?.status === 404) {
              try {
                response = await axios.get(
                  `${API_BASE_URL}/votes/check/${electionId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (thirdError) {
                if (thirdError.response?.status === 404) {
                  try {
                    response = await axios.get(
                      `${API_BASE_URL}/elections/${electionId}/user-vote`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                  } catch (fourthError) {
                    console.log('All vote check endpoints returned 404 - assuming user has not voted');
                    setVotedCandidateId(null);
                    setHasVoted(false);
                    return;
                  }
                } else {
                  throw thirdError;
                }
              }
            } else {
              throw secondError;
            }
          }
        } else {
          throw firstError;
        }
      }
      
      const data = response.data;
      console.log('Vote check response:', data);

      if (data.success && data.hasVoted && data.vote) {
        setVotedCandidateId(data.vote.candidate);
        setHasVoted(true);
        console.log('User has voted for candidate:', data.vote.candidate);
      } else if (data.hasVoted && data.candidateId) {
        setVotedCandidateId(data.candidateId);
        setHasVoted(true);
        console.log('User has voted for candidate:', data.candidateId);
      } else if (data.vote && data.vote.candidateId) {
        setVotedCandidateId(data.vote.candidateId);
        setHasVoted(true);
        console.log('User has voted for candidate:', data.vote.candidateId);
      } else {
        setVotedCandidateId(null);
        setHasVoted(false);
        console.log('User has not voted yet');
      }
      
    } catch (err) {
      console.log('Check existing vote error:', err.response?.status, err.message);
    
      if (err.response?.status === 404) {
        console.log('404 error - assuming user has not voted');
        setVotedCandidateId(null);
        setHasVoted(false);
      } else if (err.response?.status === 401) {
        console.error('Unauthorized - please log in again');
        setError('Session expired. Please log in again.');
      } else {
        console.error('Error checking existing vote:', err);
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
          electionsArray = data.elections;
        } else if (data && data.success && Array.isArray(data.elections)) {
          electionsArray = data.elections;
        } else if (Array.isArray(data)) {
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
        
        const response = await axios.get(
          `${API_BASE_URL}/candidates/public/election/${selectedElectionId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );
        
        const data = response.data;
        
        console.log('Candidates API Response:', data);
        
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
          switch (status) {
            case 404:
              errorMessage = 'No candidates found for this election or election not found.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please log in again.';
              break;
            case 403:
              errorMessage = 'Access denied. Please check your permissions.';
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
      toast.error('Please log in first to vote.');
      return;
    }

    // Check if user is admin
    if (userRole === 'admin') {
      const message = 'Administrators are not allowed to vote in elections';
      setError(message);
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: <Shield size={20} />,
        style: {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #F59E0B'
        }
      });
      return;
    }

    if (hasVoted) {
      const message = 'You have already voted in this election. Only one vote per election is allowed.';
      setError(message);
      toast.warning(message);
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/votes`,
        { electionId: selectedElectionId, candidateId: candidate._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVotedCandidateId(candidate._id);
        setHasVoted(true);
        
        setCandidates(prev => 
          prev.map(c => 
            c._id === candidate._id 
              ? { ...c, votes: (c.votes || 0) + 1 }
              : c
          )
        );

        setError('');
        toast.success(`Vote cast successfully for ${candidate.name}!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: <CheckCircle size={20} />
        });
      }

    } catch (err) {
      console.error('Error casting vote:', err);
      
      let errorMessage = 'Something went wrong while voting.';
      
      if (err.response?.data) {
        const { message, alreadyVoted } = err.response.data;
        
        if (message === 'Administrators are not allowed to vote in elections') {
          errorMessage = message;
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: <Shield size={20} />,
            style: {
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B'
            }
          });
        } else if (alreadyVoted) {
          setHasVoted(true);
          setVotedCandidateId(err.response.data.votedFor);
          errorMessage = 'You have already voted in this election. Only one vote per election is allowed.';
          toast.warning(errorMessage);
        } else {
          errorMessage = message || errorMessage;
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  if (error && !candidates.length) {
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
          </motion.div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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

        {selectedElection && (
          <ElectionHeader 
            election={selectedElection} 
            candidatesCount={candidates.length}
            hasVoted={hasVoted}
            userRole={userRole}
          />
        )}

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
                  userRole={userRole}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!hasVoted && candidates.length > 0 && userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Important Voting Rules</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>You can only vote for ONE candidate per election</strong></li>
                  <li>• Review all candidates carefully before making your choice</li>
                  <li>• Once you vote, you cannot change your selection</li>
                  <li>• Your vote is anonymous and secure</li>
                  <li>• Click the "Vote" button to cast your ballot</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {userRole === 'admin' && candidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Administrator Information</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• <strong>You are viewing this election as an administrator</strong></li>
                  <li>• Administrators cannot vote to maintain election integrity</li>
                  <li>• You can view candidate information and monitor the election</li>
                  <li>• Use the admin dashboard to manage elections and view results</li>
                  <li>• All voting actions are restricted for admin accounts</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {hasVoted && candidates.length > 0 && userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-2">Vote Successfully Cast!</h4>
                <p className="text-sm text-green-800">
                  Thank you for participating in this election. Your vote has been recorded and cannot be changed. 
                  You can view the election results once voting concludes.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default Vote;