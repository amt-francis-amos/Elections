import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileVoteOpen, setIsMobileVoteOpen] = useState(false);

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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
         
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-sm">NB</div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                NUDOM SCHOOL
              </h1>
              <p className="text-xs text-gray-600 -mt-1">
                OF BUSINESS & TECHNOLOGY
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-gray-900">NSBT</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#home" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
              onClick={closeDropdown}
            >
              Home
            </a>
            
           
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                <span>Vote</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <a href="#elections" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={closeDropdown}>
                    Current Elections
                  </a>
                  <a href="#candidates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={closeDropdown}>
                    View Candidates
                  </a>
                  <a href="#results" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={closeDropdown}>
                    Election Results
                  </a>
                </div>
              )}
            </div>

            <a 
              href="#admin" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
              onClick={closeDropdown}
            >
              Admin
            </a>

           
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md">
              Vote Now
            </button>
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
              <a
                href="#home"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Home
              </a>
              
             
              <div className="space-y-1">
                <button 
                  className="flex items-center justify-between w-full text-left px-3 py-2 text-gray-900 font-medium border-b border-gray-100 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={toggleMobileVote}
                >
                  <span>Vote</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileVoteOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileVoteOpen && (
                  <div className="space-y-1">
                    <a
                      href="#elections"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      Current Elections
                    </a>
                    <a
                      href="#candidates"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      View Candidates
                    </a>
                    <a
                      href="#results"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileVote}
                    >
                      Election Results
                    </a>
                  </div>
                )}
              </div>

              <a
                href="#admin"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Admin
              </a>

           
              <div className="pt-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm">
                  Vote Now
                </button>
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