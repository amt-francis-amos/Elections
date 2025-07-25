import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, LogOut, User, Settings, UserCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import Login from '../pages/Login'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileVoteOpen, setIsMobileVoteOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const userData = localStorage.getItem('userData')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const toggleMobileVote = () => setIsMobileVoteOpen(!isMobileVoteOpen)
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)
  const closeDropdown = () => setIsDropdownOpen(false)
  const closeMobileVote = () => setIsMobileVoteOpen(false)
  const closeProfileMenu = () => setIsProfileMenuOpen(false)
  const isActive = path => location.pathname === path
  
  const openAuthModal = () => {
    setIsAuthModalOpen(true)
    closeDropdown()
    closeMenu()
  }
  
  const closeAuthModal = () => setIsAuthModalOpen(false)
  
const handleLoginSuccess = ({ user, token }) => {
  setUser(user)
  localStorage.setItem('userData', JSON.stringify(user))
  localStorage.setItem('userToken', token)
  closeAuthModal()
}

  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    closeProfileMenu()
    window.location.href = '/'
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : 'U'
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" onClick={closeDropdown}>
              <img src={assets.logo} alt="NSBT LOGO" className="w-[150px]" />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                onClick={closeDropdown}
                className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                  isActive('/')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Home
                <span
                  className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                    isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
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
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                      location.pathname.includes('/vote')
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/vote/elections"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      Current Elections
                    </Link>
                    <Link
                      to="/vote/candidates"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      View Candidates
                    </Link>
                    <Link
                      to="/vote/results"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      Election Results
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/admin"
                onClick={closeDropdown}
                className={`relative font-medium transition-colors duration-200 px-3 py-2 rounded-md group ${
                  isActive('/admin')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Admin
                <span
                  className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#03073d] transform transition-transform duration-300 ${
                    isActive('/admin') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>

              <Link
                to="/vote"
                className="bg-[#03073d] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Vote Now
              </Link>

              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-all duration-200 group"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-200">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                     
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                     
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={closeProfileMenu}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                            <UserCircle size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">My Profile</p>
                            <p className="text-xs text-gray-500">View and edit profile</p>
                          </div>
                        </Link>

                      
                      </div>

                   
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 w-full group"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                            <LogOut size={18} className="text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">Sign Out</p>
                            <p className="text-xs text-red-500">Logout from account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <User size={16} /> Login
                </button>
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
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>

                <div className="space-y-1">
                  <button
                    onClick={toggleMobileVote}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 font-medium border-b border-gray-100 rounded-md transition-colors duration-200 ${
                      location.pathname.includes('/vote')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-900 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Vote</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMobileVoteOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMobileVoteOpen && (
                    <div className="space-y-1">
                      <Link
                        to="/vote/elections"
                        onClick={closeMobileVote}
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Current Elections
                      </Link>
                      <Link
                        to="/vote/candidates"
                        onClick={closeMobileVote}
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        View Candidates
                      </Link>
                      <Link
                        to="/vote/results"
                        onClick={closeMobileVote}
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Election Results
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isActive('/admin')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </Link>

                <Link
                  to="/vote"
                  onClick={closeMenu}
                  className="block w-full bg-[#03073d] hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-center"
                >
                  Vote Now
                </Link>

                {user ? (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-2 w-full text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <UserCircle size={16} /> My Profile
                    </Link>
                    
                
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 mt-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="flex items-center gap-2 w-full text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 mt-2"
                  >
                    <User size={16} /> Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {isAuthModalOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={closeAuthModal} />}

      <Login isOpen={isAuthModalOpen} onClose={closeAuthModal} onLoginSuccess={handleLoginSuccess} />
    </>
  )
}

export default Navbar