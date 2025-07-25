import React from "react";
import { ChevronRight, Users, Shield, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-blue-800/50 to-indigo-900/50"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 md:items-center min-h-[80vh]">
          <motion.div
            className="lg:col-span-7 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/20"
              custom={1}
              variants={fadeInUp}
            >
              <Shield className="w-4 h-4 mr-2" />
              NSBT Voting System
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
              custom={2}
              variants={fadeInUp}
            >
              Welcome to
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">
                NSBT Voting System
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-blue-100 mb-8 leading-relaxed max-w-xl"
              custom={3}
              variants={fadeInUp}
            >
              Your voice matters in shaping the future of Nudom School of
              Business & Technology. Participate in the SRC 2025 Elections and
              make your vote count.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-10"
              custom={4}
              variants={fadeInUp}
            >
              <Link to="/vote">
                <button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25">
                  <span className="flex items-center justify-center">
                    Vote Now
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>

              <Link to="/vote/candidates">
                <button className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  View Candidates
                </button>
              </Link>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-4 text-center"
              custom={5}
              variants={fadeInUp}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">2025</div>
                <div className="text-blue-200 text-xs">SRC Elections</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-blue-200 text-xs">Secure Voting</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-blue-200 text-xs">Platform Access</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
              <motion.div
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure</h3>
                  <p className="text-blue-200 text-sm">
                    Advanced security measures protect your vote
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Transparent</h3>
                  <p className="text-blue-200 text-sm">
                    Open and verifiable election process
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Decentralized</h3>
                  <p className="text-blue-200 text-sm">
                    Distributed system for fair elections
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
