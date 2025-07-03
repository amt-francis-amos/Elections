import React from 'react'
import { motion } from 'framer-motion'
import { candidates } from '../assets/assets'

const Candidates = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white py-20 px-6 text-center overflow-hidden">
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
          Get to know the individuals running for leadership. Review their profiles and make an informed choice.
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
        {candidates.map((candidate) => (
          <motion.div
            key={candidate.id}
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
        ))}
      </motion.div>
    </div>
  )
}

export default Candidates
