import React from 'react';
import { assets, candidates } from '../assets/assets';
import { motion } from 'framer-motion';

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const Elections = () => {
  return (
    <div className="min-h-screen bg-gray-100">
     
      <section className="relative h-[80vh] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${assets.elect})` }}
        ></div>

        <div className="absolute inset-0 bg-black opacity-60"></div>

        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            NSBT Elections Portal
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Make your voice count. Vote for a better tomorrow.
          </p>
        </motion.div>
      </section>

     
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Meet the Candidates
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-60 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.position}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Elections;
