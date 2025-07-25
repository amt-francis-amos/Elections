import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

export const authenticateToken = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Token is valid but user not found' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' })
    }

    res.status(500).json({ message: 'Authentication error' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      req.user = null
      return next()
    }

    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.userId).select('-password')

    req.user = user || null
    next()
  } catch {
    req.user = null
    next()
  }
}
