import express from 'express'
import { registerUser } from '../controllers/userController'

const router = express.Router()

router.post('/api/users/register', registerUser)

export default router
