
import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import Login from '../pages/Login'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileVoteOpen, setIsMobileVoteOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const userData = localStorage.getItem('userData')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const toggleMobileVote = () => setIsMobileVoteOpen(!isMobileVoteOpen)
  const closeMenu = () => setIsMenuOpen(false)
  const closeDropdown = () => setIsDropdownOpen(false)
  const closeMobileVote = () => setIsMobileVoteOpen(false)
  const isActive = path => location.pathname === path
  const openAuthModal = () => {
    setIsAuthModalOpen(true)
    closeDropdown()
    closeMenu()
  }
  const closeAuthModal = () => setIsAuthModalOpen(false)
  const handleLoginSuccess = userData => {
    setUser(userData)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('userToken', 'dummyToken')
    closeAuthModal()
  }
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    window.location.href = '/'
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
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200 flex items-center gap-1"
                  >
                    <LogOut size={16} /> Logout
                  </button>
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
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors.duration-200"
                      >
                        View Candidates
                      </Link>
                      <Link
                        to="/vote/results"
                        onClick={closeMobileVote}
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors-duration-200"
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 mt-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
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
