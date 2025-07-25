import React, { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)


  useEffect(() => {
    const rateLimitExpiry = localStorage.getItem('rateLimitExpiry')
    if (rateLimitExpiry && Date.now() > parseInt(rateLimitExpiry)) {
      localStorage.removeItem('rateLimitExpiry')
      setIsRateLimited(false)
    } else if (rateLimitExpiry) {
      setIsRateLimited(true)
    }
  }, [])

  
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    

    if (!isLogin) {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required'
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters'
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const showToast = (message, type = 'error') => {
  
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    
    if (!validateForm()) return
    
    // Check rate limit
    if (isRateLimited) {
      showToast('Too many attempts. Please wait before trying again.')
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Login request
        const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/users/login', {
          email: formData.email.trim(),
          password: formData.password
        }, {
          timeout: 10000
        })
        
        showToast('Login successful!', 'success')
        
        // Prepare user data
        const userData = {
          id: response.data.user.id,
          fullName: response.data.user.fullName || formData.email.split('@')[0],
          email: response.data.user.email || formData.email,
          role: response.data.user.role,
          token: response.data.user.token
        }
        
        // Store token (Note: localStorage won't work in Claude artifacts)
        if (response.data.user.token) {
          localStorage.setItem('authToken', response.data.user.token)
          localStorage.setItem('user', JSON.stringify(userData))
        }
        
        // Call success callback
        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(userData)
        }
        
        handleClose()
        
      } else {
        // Registration request
        const response = await axios.post('https://elections-backend-j8m8.onrender.com/api/users/signup', {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password
        }, {
          timeout: 10000
        })
        
        showToast('Registration successful! Please sign in with your credentials.', 'success')
        
        // Switch to login mode and keep email
        setIsLogin(true)
        setFormData(prev => ({
          fullName: '',
          email: prev.email,
          password: '',
          confirmPassword: ''
        }))
        setErrors({})
        setShowPassword(false)
        setShowConfirmPassword(false)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        showToast('Request timeout. Please check your connection and try again.')
      } else if (error.response?.status === 429) {
        // Handle rate limiting
        setIsRateLimited(true)
        const rateLimitExpiry = Date.now() + (15 * 60 * 1000) // 15 minutes
        localStorage.setItem('rateLimitExpiry', rateLimitExpiry.toString())
        
        showToast('Too many login attempts. Please wait 15 minutes before trying again.')
        
        // Reset rate limit after 15 minutes
        setTimeout(() => {
          setIsRateLimited(false)
          localStorage.removeItem('rateLimitExpiry')
        }, 15 * 60 * 1000)
        
      } else if (error.response?.status === 401) {
        showToast('Invalid email or password. Please try again.')
      } else if (error.response?.status === 409) {
        showToast('An account with this email already exists. Please sign in instead.')
      } else if (!error.response) {
        showToast('Network error. Please check your internet connection.')
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Something went wrong. Please try again.'
        showToast(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    setIsLogin(true)
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={handleClose}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#042028] mb-1">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin ? 'Sign in to your account' : 'Join us today'}
            </p>
          </div>
        </div>
        
        {/* Rate limit warning */}
        {isRateLimited && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Too many login attempts. Please wait 15 minutes before trying again.
            </p>
          </div>
        )}
        
        {/* Form */}
        <div className="px-6 pb-8">
          {/* Full Name Field (Registration only) */}
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042028] focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-500" role="alert">{errors.fullName}</p>}
            </div>
          )}
          
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                id="email"
                name="email" 
                value={formData.email} 
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042028] focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500" role="alert">{errors.email}</p>}
          </div>
          
          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                name="password" 
                value={formData.password} 
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`w-full pl-10 pr-12 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042028] focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500" role="alert">{errors.password}</p>}
          </div>
          
          {/* Confirm Password Field (Registration only) */}
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  id="confirmPassword"
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042028] focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500" role="alert">{errors.confirmPassword}</p>}
            </div>
          )}
          
          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isLoading || isRateLimited}
            className="w-full bg-gradient-to-r from-[#042028] to-[#03181e] text-white py-2.5 px-4 rounded-xl font-semibold hover:from-[#03181e] hover:to-[#021318] focus:outline-none focus:ring-2 focus:ring-[#042028] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : isRateLimited ? (
              'Rate Limited - Please Wait'
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
          
          {/* Switch Mode */}
          <div className="text-center mb-3">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button 
                type="button" 
                onClick={switchMode}
                className="ml-2 text-[#042028] hover:text-[#03181e] font-semibold transition-colors duration-200"
                disabled={isLoading}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          
          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login