import React, { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? 'https://elections-backend-j8m8.onrender.com/api/users/login' : 'https://elections-backend-j8m8.onrender.com/api/users/signup'
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password
          }

      const { data } = await axios.post(endpoint, payload)
      onLoginSuccess(data.user)
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative bg-white shadow-xl rounded-xl p-8 w-full max-w-md animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-6 text-[#042028]">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={submit} className="space-y-5">
          {!isLogin && (
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-[#042028] rounded-md hover:bg-[#03181e] transition duration-300"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-[#042028] font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
