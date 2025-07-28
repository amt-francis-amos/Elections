import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, duration: 0.8 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const Results = () => {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          alert('🚨 Please log in to view results.');
          return;
        }

        if (!electionId) {
          alert('❌ Election ID is missing in the URL.');
          return;
        }

        console.log("📌 Fetching results for election ID:", electionId);

       
        const { data } = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/votes/${election._id}/results`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('💬 Fetched results:', data);
        setResults(data);
      } catch (err) {
        console.error(
          '❌ Error fetching results:',
          err.response?.data || err.message
        );
        alert(
          `❌ Failed to load results: ${err.response?.data?.message || err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading results…</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-100 py-12 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-4xl font-bold text-center text-gray-800 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Election Results
      </motion.h1>

      <motion.div
        className="bg-white shadow-lg rounded-xl max-w-4xl mx-auto mb-12 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-2">Total Votes Cast</h2>
        <p className="text-gray-600 text-lg">{totalVotes.toLocaleString()} votes</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((r, i) => (
          <motion.div
            key={r._id || i}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            variants={cardVariants}
          >
            <div className="h-56 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 italic">No image</span>
            </div>
            <div className="p-5 text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {r.candidateName}
              </h3>
              <div className="text-2xl font-bold text-blue-600 mt-4">
                {r.voteCount.toLocaleString()} votes
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Results;
