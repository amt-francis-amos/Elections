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
  Shield,
  ChevronLeft,
  ChevronRight,
  RotateCcw
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

const CandidateCard = ({ candidate, onVote, votingCandidateId, hasVoted, votedForThis, electionTitle, userRole, position }) => {
  const isAdminUser = userRole === 'admin';
  const isVotingThisCandidate = votingCandidateId === candidate._id;
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={!hasVoted && !isAdminUser ? "hover" : {}}
      whileTap={!hasVoted && !isAdminUser ? "tap" : {}}
      className={`
        relative bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border transition-all duration-300 cursor-pointer
        ${votedForThis ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200 hover:border-blue-300'}
        ${hasVoted && !votedForThis ? 'opacity-60' : ''}
        ${isAdminUser ? 'border-orange-200 bg-orange-50' : ''}
      `}
      onClick={() => {
        if (!hasVoted && !isAdminUser && !votingCandidateId) {
          onVote(candidate);
        }
      }}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                onVote(candidate);
              }}
              disabled={!!votingCandidateId}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:shadow-none text-sm"
            >
              {isVotingThisCandidate ? (
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

const PositionNavigation = ({ positions, currentPosition, onPositionChange, votedPositions, userRole }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Voting Positions</h2>
      
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {positions.map((position, index) => {
          const isVoted = votedPositions.includes(position);
          const isCurrent = position === currentPosition;
          
          return (
            <motion.button
              key={position}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPositionChange(position)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                ${isCurrent 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : isVoted 
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${userRole === 'admin' ? 'opacity-75' : ''}
              `}
              disabled={userRole === 'admin'}
            >
              {isVoted && <CheckCircle size={16} />}
              <span>{position}</span>
              {isCurrent && <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Current</span>}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const currentIndex = positions.indexOf(currentPosition);
            if (currentIndex > 0) {
              onPositionChange(positions[currentIndex - 1]);
            }
          }}
          disabled={positions.indexOf(currentPosition) === 0 || userRole === 'admin'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </motion.button>

        <div className="text-sm text-gray-600">
          Position {positions.indexOf(currentPosition) + 1} of {positions.length}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const currentIndex = positions.indexOf(currentPosition);
            if (currentIndex < positions.length - 1) {
              onPositionChange(positions[currentIndex + 1]);
            }
          }}
          disabled={positions.indexOf(currentPosition) === positions.length - 1 || userRole === 'admin'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const ElectionHeader = ({ election, candidatesCount, votedPositions, totalPositions, userRole, currentPosition }) => {
  const isAdminUser = userRole === 'admin';
  const votingProgress = totalPositions > 0 ? (votedPositions.length / totalPositions * 100) : 0;
  
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
          {election.description || 'Choose your preferred candidates for each position'}
        </p>
        {currentPosition && (
          <div className="mt-2 text-lg font-medium text-blue-600">
            Current Position: {currentPosition}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-4">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-900">{candidatesCount}</div>
          <div className="text-sm text-blue-700">Total Candidates</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm text-green-700 mb-1">Election Period</div>
          <div className="text-xs font-medium text-green-900">
            {election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Active'}
            {election.endDate && ` - ${new Date(election.endDate).toLocaleDateString()}`}
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-900">{totalPositions}</div>
          <div className="text-sm text-purple-700">Available Positions</div>
        </div>

        <div className={`rounded-xl p-4 ${
          isAdminUser ? 'bg-orange-50' : 'bg-yellow-50'
        }`}>
          {isAdminUser ? (
            <Shield className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          )}
          <div className={`text-xl font-bold ${
            isAdminUser ? 'text-orange-900' : 'text-yellow-900'
          }`}>
            {isAdminUser ? 'Admin' : `${votedPositions.length}/${totalPositions}`}
          </div>
          <div className={`text-sm ${
            isAdminUser ? 'text-orange-700' : 'text-yellow-700'
          }`}>
            {isAdminUser ? 'Status' : 'Positions Voted'}
          </div>
        </div>
      </div>

      {!isAdminUser && totalPositions > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Voting Progress</span>
            <span className="text-sm font-medium text-gray-900">{votingProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${votingProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
            />
          </div>
        </div>
      )}

      {votedPositions.length === totalPositions && !isAdminUser && totalPositions > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium text-green-800">Congratulations! You have completed voting for all positions!</p>
            <p className="text-sm text-green-700">Your votes have been successfully recorded for all {totalPositions} positions.</p>
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
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [votedCandidates, setVotedCandidates] = useState({});
  const [votedPositions, setVotedPositions] = useState([]);
  const [votingCandidateId, setVotingCandidateId] = useState(null); // Changed from isVoting to votingCandidateId
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);

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

  const checkExistingVotes = async (electionId) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      console.log('Checking existing votes for election:', electionId);

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
                    setVotedCandidates({});
                    setVotedPositions([]);
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

      if (data.success && data.votes && Array.isArray(data.votes)) {
        const votedCandidatesMap = {};
        const votedPositionsList = [];

        data.votes.forEach(vote => {
          votedCandidatesMap[vote.position] = vote.candidate;
          if (!votedPositionsList.includes(vote.position)) {
            votedPositionsList.push(vote.position);
          }
        });

        setVotedCandidates(votedCandidatesMap);
        setVotedPositions(votedPositionsList);
        console.log('User has voted for positions:', votedPositionsList);
      } else if (data.success && data.hasVoted && data.vote) {
        const votedCandidatesMap = {};
        votedCandidatesMap[data.vote.position] = data.vote.candidate;
        setVotedCandidates(votedCandidatesMap);
        setVotedPositions([data.vote.position]);
        console.log('User has voted for position:', data.vote.position);
      } else {
        setVotedCandidates({});
        setVotedPositions([]);
        console.log('User has not voted yet');
      }
      
    } catch (err) {
      console.log('Check existing votes error:', err.response?.status, err.message);
    
      if (err.response?.status === 404) {
        console.log('404 error - assuming user has not voted');
        setVotedCandidates({});
        setVotedPositions([]);
      } else if (err.response?.status === 401) {
        console.error('Unauthorized - please log in again');
        setError('Session expired. Please log in again.');
      } else {
        console.error('Error checking existing votes:', err);
        setVotedCandidates({});
        setVotedPositions([]);
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
        
        if (data && data.success && data.candidatesByPosition) {
          setCandidatesByPosition(data.candidatesByPosition);
          const positionsList = data.positions || Object.keys(data.candidatesByPosition);
          setPositions(positionsList);
          if (positionsList.length > 0 && !currentPosition) {
            setCurrentPosition(positionsList[0]);
          }
        } else if (data && Array.isArray(data.candidates)) {
          const groupedByPosition = {};
          const positionsList = [];
          
          data.candidates.forEach(candidate => {
            if (!groupedByPosition[candidate.position]) {
              groupedByPosition[candidate.position] = [];
              positionsList.push(candidate.position);
            }
            groupedByPosition[candidate.position].push(candidate);
          });
          
          setCandidatesByPosition(groupedByPosition);
          setPositions(positionsList);
          if (positionsList.length > 0 && !currentPosition) {
            setCurrentPosition(positionsList[0]);
          }
        } else {
          console.error('Unexpected candidates response format:', data);
          setCandidatesByPosition({});
          setPositions([]);
        }
        
        await checkExistingVotes(selectedElectionId);
        
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
    setVotedCandidates({});
    setVotedPositions([]);
    setCandidatesByPosition({});
    setPositions([]);
    setCurrentPosition('');
  };

  const handlePositionChange = (position) => {
    setCurrentPosition(position);
  };

  const handleVote = async (candidate) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Please log in first to vote.');
      toast.error('Please log in first to vote.');
      return;
    }

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

    if (votedPositions.includes(candidate.position)) {
      const message = `You have already voted for the ${candidate.position} position. Only one vote per position is allowed.`;
      setError(message);
      toast.warning(message);
      return;
    }

    setVotingCandidateId(candidate._id); // Set the specific candidate being voted for
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/votes`,
        { electionId: selectedElectionId, candidateId: candidate._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVotedCandidates(prev => ({
          ...prev,
          [candidate.position]: candidate._id
        }));
        
        setVotedPositions(prev => [...prev, candidate.position]);
        
        setCandidatesByPosition(prev => ({
          ...prev,
          [candidate.position]: prev[candidate.position].map(c => 
            c._id === candidate._id 
              ? { ...c, votes: (c.votes || 0) + 1 }
              : c
          )
        }));

        setError('');
        toast.success(`Vote cast successfully for ${candidate.name} (${candidate.position})!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: <CheckCircle size={20} />
        });

        const nextPositionIndex = positions.indexOf(candidate.position) + 1;
        if (nextPositionIndex < positions.length) {
          setTimeout(() => {
            setCurrentPosition(positions[nextPositionIndex]);
          }, 1500);
        }
      }

    } catch (err) {
      console.error('Error casting vote:', err);
      
      let errorMessage = 'Something went wrong while voting.';
      
      if (err.response?.data) {
        const { message, alreadyVoted, position } = err.response.data;
        
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
          setVotedPositions(prev => {
            if (!prev.includes(position || candidate.position)) {
              return [...prev, position || candidate.position];
            }
            return prev;
          });
          setVotedCandidates(prev => ({
            ...prev,
            [position || candidate.position]: err.response.data.votedFor
          }));
          errorMessage = `You have already voted for the ${position || candidate.position} position. Only one vote per position is allowed.`;
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
      setVotingCandidateId(null); // Clear the voting state
    }
  };

  const currentCandidates = candidatesByPosition[currentPosition] || [];
  const totalCandidates = Object.values(candidatesByPosition).flat().length;

  if (error && !Object.keys(candidatesByPosition).length) {
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
            candidatesCount={totalCandidates}
            votedPositions={votedPositions}
            totalPositions={positions.length}
            userRole={userRole}
            currentPosition={currentPosition}
          />
        )}

        {positions.length > 0 && (
          <PositionNavigation
            positions={positions}
            currentPosition={currentPosition}
            onPositionChange={handlePositionChange}
            votedPositions={votedPositions}
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

        {!loading && currentCandidates.length === 0 && currentPosition && (
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
              No candidates have been registered for the {currentPosition} position yet.
            </p>
          </motion.div>
        )}

        {!loading && currentCandidates.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPosition} Candidates
              </h2>
              <p className="text-gray-600">
                {votedPositions.includes(currentPosition) 
                  ? `You have voted for this position` 
                  : `Click on a candidate card to vote for ${currentPosition}`
                }
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {currentCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    onVote={handleVote}
                    votingCandidateId={votingCandidateId}
                    hasVoted={votedPositions.includes(candidate.position)}
                    votedForThis={votedCandidates[candidate.position] === candidate._id}
                    electionTitle={selectedElection?.title}
                    userRole={userRole}
                    position={currentPosition}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {!votedPositions.includes(currentPosition) && currentCandidates.length > 0 && userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Important Voting Rules for {currentPosition}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Click on any candidate card to vote for them</strong></li>
                  <li>• You can only vote for ONE candidate per position</li>
                  <li>• Review all candidates carefully before making your choice</li>
                  <li>• Once you vote for this position, you cannot change your selection</li>
                  <li>• Your vote is anonymous and secure</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {userRole === 'admin' && currentCandidates.length > 0 && (
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

        {votedPositions.includes(currentPosition) && currentCandidates.length > 0 && userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-2">Vote Successfully Cast for {currentPosition}!</h4>
                <p className="text-sm text-green-800">
                  Your vote for the {currentPosition} position has been recorded and cannot be changed. 
                  {positions.indexOf(currentPosition) < positions.length - 1 
                    ? ' You can now vote for the next position.' 
                    : ' You have completed voting for all positions in this election.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
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