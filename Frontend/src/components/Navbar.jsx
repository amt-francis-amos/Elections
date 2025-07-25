import React, { useState } from 'react';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import {assets}  from '../assets/assets.js'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileVoteOpen, setIsMobileVoteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  

  const [user, setUser] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileVote = () => {
    setIsMobileVoteOpen(!isMobileVoteOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
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

  const handleLogout = () => {
    setUser(null);
    setIsUserDropdownOpen(false);
    
  };

  const isActive = (path) => currentPath === path;

  const handleNavigation = (path) => {
    setCurrentPath(path);
    closeMenu();
    closeDropdown();
  };

 
  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
   
    setUser({ 
      id: 1, 
      name: 'John Doe', 
      email: email,
      role: 'student' 
    });
    closeAuthModal();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const studentId = formData.get('studentId');
    

    setUser({ 
      id: 1, 
      name: name, 
      email: email,
      studentId: studentId,
      role: 'student' 
    });
    closeAuthModal();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <button onClick={() => handleNavigation('/')} className="focus:outline-none">
                <img src={assets.logo} alt="NSBT LOGO" className='w-[150px]' />
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => handleNavigation('/')}
                className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                  isActive('/') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </button>
              
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={`flex items-center space-x-1 font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                    currentPath.includes('/vote') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Vote</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                    currentPath.includes('/vote') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button 
                      onClick={() => handleNavigation('/vote/elections')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    >
                      Current Elections
                    </button>
                    <button 
                      onClick={() => handleNavigation('/vote/candidates')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    >
                      View Candidates
                    </button>
                    <button 
                      onClick={() => handleNavigation('/vote/results')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" 
                    >
                      Election Results
                    </button>
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                    isActive('/admin') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                  <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                    isActive('/admin') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleNavigation('/vote')}
                    className="bg-[#03073d] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    Vote Now
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-[#03073d] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isUserDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => { handleNavigation('/profile'); setIsUserDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          Profile
                        </button>
                        <button 
                          onClick={() => { handleNavigation('/my-votes'); setIsUserDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          My Votes
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-[#03073d] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}
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
                <button
                  onClick={() => handleNavigation('/')}
                  className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isActive('/') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </button>
                
                <div className="space-y-1">
                  <button 
                    className={`flex items-center justify-between w-full text-left px-3 py-2 font-medium border-b border-gray-100 rounded-md transition-colors duration-200 ${
                      currentPath.includes('/vote') 
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
                      <button
                        onClick={() => handleNavigation('/vote/elections')}
                        className="block w-full text-left px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Current Elections
                      </button>
                      <button
                        onClick={() => handleNavigation('/vote/candidates')}
                        className="block w-full text-left px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        View Candidates
                      </button>
                      <button
                        onClick={() => handleNavigation('/vote/results')}
                        className="block w-full text-left px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Election Results
                      </button>
                    </div>
                  )}
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                      isActive('/admin') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    Admin
                  </button>
                )}

                {user ? (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#03073d] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/vote')}
                      className="block w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-center mx-3"
                    >
                      Vote Now
                    </button>
                    <button
                      onClick={() => handleNavigation('/profile')}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleNavigation('/my-votes')}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      My Votes
                    </button>
                    <button 
                      onClick={() => { handleLogout(); closeMenu(); }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <button 
                      onClick={() => { openAuthModal('login'); closeMenu(); }}
                      className="block w-full text-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => { openAuthModal('signup'); closeMenu(); }}
                      className="block w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      
        {(isDropdownOpen || isUserDropdownOpen) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsDropdownOpen(false);
              setIsUserDropdownOpen(false);
            }}
          />
        )}
      </nav>

     
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={closeAuthModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {authMode === 'login' ? (
                <div onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const email = document.getElementById('email').value;
                      const password = document.getElementById('password').value;
                      setUser({ 
                        id: 1, 
                        name: 'John Doe', 
                        email: email,
                        role: 'student' 
                      });
                      closeAuthModal();
                    }}
                    className="w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your student ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const name = document.getElementById('name').value;
                      const email = document.getElementById('signup-email').value;
                      const studentId = document.getElementById('studentId').value;
                      setUser({ 
                        id: 1, 
                        name: name, 
                        email: email,
                        studentId: studentId,
                        role: 'student' 
                      });
                      closeAuthModal();
                    }}
                    className="w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Create Account
                  </button>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={switchAuthMode}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;