import React from 'react'
import { motion } from 'framer-motion'
import { candidates } from '../assets/assets'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const Results = () => {
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

      {/* Summary */}
      <motion.div
        className="bg-white shadow-lg rounded-xl max-w-4xl mx-auto mb-12 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-2">Total Votes Cast</h2>
        <p className="text-gray-600 text-lg">2,345 votes</p>
      </motion.div>

      {/* Results Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            variants={cardVariants}
          >
            <img
              src={candidate.image}
              alt={candidate.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-5 text-center">
              <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{candidate.position}</p>
              <div className="text-2xl font-bold text-blue-600 mt-4">
                {candidate.votes ?? Math.floor(Math.random() * 500 + 100)} votes
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Results
