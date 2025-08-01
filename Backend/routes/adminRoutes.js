import express from 'express'
import {
  promoteToAdmin,
  deleteUser,
  updateUser,
  createVoter,
  getAllVoters,
  getStats,
  exportElectionResults,
  exportAllData  // Added new export function
} from '../controllers/adminController.js'
import {
  createElection,
  getAllElections,
  updateElection,
  deleteElection,
  getElectionById
} from '../controllers/electionController.js'
import auth from '../middlewares/auth.js'
import { authorizeRoles } from '../middlewares/authorizeRoles.js'

const router = express.Router()

// User management routes
router.post('/promote', auth, authorizeRoles('admin'), promoteToAdmin)
router.put('/users/:id', auth, authorizeRoles('admin'), updateUser)
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser)
router.post('/create-voter', auth, authorizeRoles('admin'), createVoter)
router.get('/voters', auth, authorizeRoles('admin'), getAllVoters)
router.get('/stats', auth, authorizeRoles('admin'), getStats)

// Export routes
router.get('/export', auth, authorizeRoles('admin'), exportElectionResults)  // For specific election export
router.get('/export-all', auth, authorizeRoles('admin'), exportAllData)      // For all data export

// Election management routes
router.post('/elections', auth, authorizeRoles('admin'), createElection)
router.get('/elections', auth, authorizeRoles('admin'), getAllElections)
router.get('/elections/:id', auth, authorizeRoles('admin'), getElectionById)
router.put('/elections/:id', auth, authorizeRoles('admin'), updateElection)
router.delete('/elections/:id', auth, authorizeRoles('admin'), deleteElection)

export default router