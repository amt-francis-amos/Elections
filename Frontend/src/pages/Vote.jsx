import React from 'react'
import { candidates } from '../assets/assets'
import { motion } from 'framer-motion'

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut'
    }
  })
}

const Vote = () => {
  const handleVote = (candidate) => {
    alert(`You voted for ${candidate.name}`)
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800">{candidate.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{candidate.position}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(candidate)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Vote
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Vote
