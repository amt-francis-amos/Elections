import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

export const signupUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const newUser = new User({ fullName, email, password })
    await newUser.save()

    const token = generateToken(newUser._id)

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
