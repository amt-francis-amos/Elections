import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Check if token exists
        if (!token) {
          toast.error('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const electionId = '64ef1234abcd5678ef901234';

        // First test the debug route
        const testRes = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/test`
        );
        console.log('Server test response:', testRes.data);

        const res = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/candidates/${electionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          }
        );

        setCandidates(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading candidates:", err);
        setLoading(false);
        
        if (err.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please check your internet connection.');
        } else if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const message = err.response.data?.message;
          
          if (status === 401 || message === 'Access denied. User not found.') {
            localStorage.removeItem('token');
            toast.error('Session expired. Please log in again.');
          } else if (status === 404) {
            toast.error('Election or candidates not found.');
          } else if (status === 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(message || 'Failed to load candidates.');
          }
        } else if (err.request) {
          // Network error
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      }
    };

    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="bg-blue-900 text-white py-20 px-6 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Meet the Candidates
        </motion.h1>
        <motion.p
          className="max-w-xl mx-auto text-lg opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Get to know the individuals running for leadership.
        </motion.p>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 py-20">
            No candidates found for this election.
          </p>
        ) : (
          candidates.map((candidate) => (
            <motion.div
              key={candidate._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img
                src={candidate.image || '/api/placeholder/400/300'}
                alt={candidate.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/300';
                }}
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
                <p className="text-gray-500 mb-4">{candidate.position}</p>
                <button className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Candidates;