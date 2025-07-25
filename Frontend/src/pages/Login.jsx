import React, { useState } from 'react'
import { X } from 'lucide-react'

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)

  if (!isOpen) return null

  const submit = e => {
    e.preventDefault()
    onLoginSuccess({ name: 'User' })
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

        <form onSubmit={submit} className="space-y-5">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#042028]"
            />
          )}
          <button
            type="submit"
            className="w-full py-2 text-white bg-[#042028] rounded-md hover:bg-[#03181e] transition duration-300"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
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
