import express from 'express'
import {
  promoteToAdmin,
  deleteUser,
  updateUser,
  createVoter,
  getAllVoters,
  getStats,
  exportElectionResults
} from '../controllers/adminController.js'
import auth from '../middlewares/auth.js'
import { authorizeRoles } from '../middlewares/authorizeRoles.js'

const router = express.Router()


router.post('/promote', auth, authorizeRoles('admin'), promoteToAdmin)
router.put('/users/:id', auth, authorizeRoles('admin'), updateUser)
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser)
router.post('/create-voter', auth, authorizeRoles('admin'), createVoter)
router.get('/voters', auth, authorizeRoles('admin'), getAllVoters)
router.get('/stats', auth, authorizeRoles('admin'), getStats)
router.get('/export', auth, authorizeRoles('admin'), exportElectionResults)


export default router