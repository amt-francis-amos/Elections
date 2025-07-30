import React from "react";
import { ChevronRight, Users, Shield, Vote } from "lucide-react";
import {Link} from 'react-router-dom'

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center min-h-[calc(100vh-8rem)] sm:min-h-[80vh]">
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-xs sm:text-sm font-medium backdrop-blur-sm border border-blue-400/20">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              NSBT Voting System
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Welcome to
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text mt-2">
                NSBT Voting System
              </span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-none lg:max-w-xl mx-auto lg:mx-0">
              Your voice matters in shaping the future of Nudom School of
              Business & Technology. Participate in the SRC 2025 Elections and
              make your vote count.
            </p>

            <div className="flex justify-center lg:justify-start">
           <Link to='/vote'>
              <button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto max-w-xs sm:max-w-none">
                <span className="flex items-center justify-center">
                  Vote Now
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
           </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center max-w-md mx-auto lg:max-w-none lg:mx-0">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  2025
                </div>
                <div className="text-blue-200 text-xs">SRC Elections</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  100%
                </div>
                <div className="text-blue-200 text-xs">Secure Voting</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  24/7
                </div>
                <div className="text-blue-200 text-xs">Platform Access</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl sm:rounded-3xl blur-3xl"></div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      Secure
                    </h3>
                    <p className="text-blue-200 text-xs sm:text-sm leading-tight">
                      Advanced security measures protect your vote
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      Transparent
                    </h3>
                    <p className="text-blue-200 text-xs sm:text-sm leading-tight">
                      Open and verifiable election process
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Vote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      Decentralized
                    </h3>
                    <p className="text-blue-200 text-xs sm:text-sm leading-tight">
                      Distributed system for fair elections
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
