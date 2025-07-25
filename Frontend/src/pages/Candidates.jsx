
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('token');
        const electionId = '64ef1234abcd5678ef901234';

        const res = await axios.get(
          `https://elections-backend-j8m8.onrender.com/api/candidates/${electionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCandidates(res.data);
      } catch (err) {
  console.error("Error loading candidates:", err);
  
  if (err.response?.data?.message === 'Access denied. User not found.') {
    localStorage.removeItem('token');
    toast.error('Session expired. Please log in again.');
   
  } else {
    toast.error('Failed to load candidates. Please try again later.');
  }
}

    };

    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
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
        {candidates.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">No candidates found.</p>
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
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-56 object-cover"
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
