import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

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
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          alert("🚨 Please log in to view results.");
          navigate("/login");
          return;
        }

        // Validate electionId
        if (!electionId || electionId === ":electionId") {
          setError("❌ Invalid or missing election ID in the URL.");
          setLoading(false);
          return;
        }

        // Check if electionId is a valid MongoDB ObjectId format (24 hex characters)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(electionId)) {
          setError("❌ Invalid election ID format.");
          setLoading(false);
          return;
        }

        console.log("📌 Fetching results for election ID:", electionId);

        const { data } = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/votes/${electionId}/results`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("💬 Fetched results:", data);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error(
          "❌ Error fetching results:",
          err.response?.data || err.message
        );
        
        const errorMessage = err.response?.data?.message || err.message;
        setError(`❌ Failed to load results: ${errorMessage}`);
        
        // If the error is specifically about invalid election ID, show a more user-friendly message
        if (errorMessage.includes("Invalid election ID") || err.response?.status === 404) {
          setError("❌ Election not found. Please check the election ID and try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/election")}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Results Available</h2>
          <p className="text-gray-600 mb-6">No votes have been cast for this election yet.</p>
          <button
            onClick={() => navigate("/election")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Elections
          </button>
        </div>
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
        <p className="text-gray-600 text-lg">
          {totalVotes.toLocaleString()} votes
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((r, i) => (
          <motion.div
            key={r._id || i}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            variants={cardVariants}
          >
            <div className="h-56 bg-gray-200 flex items-center justify-center overflow-hidden">
              {r.candidateImage || r.image || r.profilePicture ? (
                <img
                  src={r.candidateImage || r.image || r.profilePicture}
                  alt={r.candidateName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center" style={{ display: r.candidateImage || r.image || r.profilePicture ? 'none' : 'flex' }}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                    {r.candidateName ? r.candidateName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="text-gray-500 text-sm">No image available</span>
                </div>
              </div>
            </div>
            <div className="p-5 text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {r.candidateName}
              </h3>
              <div className="text-2xl font-bold text-blue-600 mt-4">
                {r.voteCount.toLocaleString()} votes
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {totalVotes > 0 ? `${((r.voteCount / totalVotes) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Results;