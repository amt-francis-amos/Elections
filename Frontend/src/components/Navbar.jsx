import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileVoteOpen, setIsMobileVoteOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileVote = () => {
    setIsMobileVoteOpen(!isMobileVoteOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const closeMobileVote = () => {
    setIsMobileVoteOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <Link to="/" onClick={closeDropdown}>
              <img src={assets.logo} alt="NSBT LOGO" className='w-[150px]' />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                isActive('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={closeDropdown}
            >
              Home
              <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className={`flex items-center space-x-1 font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                  location.pathname.includes('/vote') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>Vote</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                  location.pathname.includes('/vote') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    to="/vote/elections" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    onClick={closeDropdown}
                  >
                    Current Elections
                  </Link>
                  <Link 
                    to="/vote/candidates" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    onClick={closeDropdown}
                  >
                    View Candidates
                  </Link>
                  <Link 
                    to="/vote/results" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    onClick={closeDropdown}
                  >
                    Election Results
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/admin" 
              className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                isActive('/admin') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={closeDropdown}
            >
              Admin
              <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                isActive('/admin') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>

            <Link 
              to="/vote" 
              className="bg-[#03073d] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              Vote Now
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              
              <div className="space-y-1">
                <button 
                  className={`flex items-center justify-between w-full text-left px-3 py-2 font-medium border-b border-gray-100 rounded-md transition-colors duration-200 ${
                    location.pathname.includes('/vote') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileVote}
                >
                  <span>Vote</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileVoteOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileVoteOpen && (
                  <div className="space-y-1">
                    <Link
                      to="/vote/elections"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      Current Elections
                    </Link>
                    <Link
                      to="/vote/candidates"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      View Candidates
                    </Link>
                    <Link
                      to="/vote/results"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      Election Results
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isActive('/admin') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                Admin
              </Link>

              <div className="pt-2">
                <Link 
                  to="/vote" 
                  className="block w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-center"
                  onClick={closeMenu}
                >
                  Vote Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;