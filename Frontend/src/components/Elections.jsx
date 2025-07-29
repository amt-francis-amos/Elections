import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut'
    }
  })
};

const Vote = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          alert('🚨 No token found. Please log in.');
          return;
        }

        const { data } = await axios.get(
          'https://elections-backend-j8m8.onrender.com/api/elections',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('💬 fetched elections:', data);

        // Fix: Handle different possible response structures
        let electionsArray;
        
        if (Array.isArray(data)) {
          // If data is directly an array
          electionsArray = data;
        } else if (data && Array.isArray(data.elections)) {
          // If data has an elections property that's an array
          electionsArray = data.elections;
        } else if (data && Array.isArray(data.data)) {
          // If data has a data property that's an array
          electionsArray = data.data;
        } else {
          // If none of the above, log the structure and set empty array
          console.error('Unexpected data structure:', data);
          electionsArray = [];
        }

        const active = electionsArray.filter(e => e && e.isActive);
        setElections(active);
        if (active.length) setSelectedElectionId(active[0]._id);
      } catch (err) {
        console.error('Error fetching elections:', err);
        alert('❌ Failed to load elections.');
      }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const { data } = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/candidates/${selectedElectionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`💬 candidates for ${selectedElectionId}:`, data);
        
        // Fix: Handle different possible response structures for candidates too
        let candidatesArray;
        
        if (Array.isArray(data)) {
          candidatesArray = data;
        } else if (data && Array.isArray(data.candidates)) {
          candidatesArray = data.candidates;
        } else if (data && Array.isArray(data.data)) {
          candidatesArray = data.data;
        } else {
          console.error('Unexpected candidates data structure:', data);
          candidatesArray = [];
        }
        
        setCandidates(candidatesArray);
      } catch (err) {
        console.error('Error loading candidates:', err);
        alert('❌ Failed to load candidates.');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [selectedElectionId]);

  const handleVote = async candidate => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('🚨 Please log in first to vote.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'https://elections-backend-j8m8.onrender.com/api/votes',
        { electionId: selectedElectionId, candidateId: candidate._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Vote submitted for ${candidate.name}`);
      setVotedCandidateId(candidate._id);
    } catch (err) {
      console.error('Error casting vote:', err);
      const message = err.response?.data?.message || 'Something went wrong while voting.';
      alert(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-center text-gray-800 mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Vote for Your Leaders
        </motion.h1>

        {elections.length > 0 ? (
          <div className="mb-6 max-w-sm mx-auto">
            <label className="block mb-2 font-medium text-gray-700">
              Select Election
            </label>
            <select
              value={selectedElectionId}
              onChange={e => setSelectedElectionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {elections.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No active elections available.
          </p>
        )}

        {loading && (
          <p className="text-center text-gray-700">Loading candidates…</p>
        )}
        {!loading && candidates.length === 0 && selectedElectionId && (
          <p className="text-center text-gray-600">
            No candidates found for this election.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((c, i) => (
            <motion.div
              key={c._id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileHover={{ scale: 1.03 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-shadow ${
                votedCandidateId === c._id ? 'ring-4 ring-green-500' : ''
              }`}
            >
              <img src={c.image} alt={c.name} className="w-full h-56 object-cover" />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800">{c.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{c.position}</p>

                {votedCandidateId ? (
                  votedCandidateId === c._id ? (
                    <p className="text-green-600 font-semibold text-center">
                      You voted for this candidate ✅
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm text-center">
                      You have already voted
                    </p>
                  )
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(c)}
                    disabled={loading}
                    className="w-full py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Vote
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vote;