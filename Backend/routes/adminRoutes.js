import express from 'express'
import {
  promoteToAdmin,
  deleteUser,
  createVoter,
  getAllVoters,
  exportElectionResults
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

router.post('/promote', auth, authorizeRoles('admin'), promoteToAdmin)
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser)
router.post('/create-voter', auth, authorizeRoles('admin'), createVoter)
router.get('/voters', auth, authorizeRoles('admin'), getAllVoters)
router.get('/export', auth, authorizeRoles('admin'), exportElectionResults)

router.post('/elections', auth, authorizeRoles('admin'), createElection)
router.get('/elections', auth, authorizeRoles('admin'), getAllElections)
router.get('/elections/:id', auth, authorizeRoles('admin'), getElectionById)
router.put('/elections/:id', auth, authorizeRoles('admin'), updateElection)
router.delete('/elections/:id', auth, authorizeRoles('admin'), deleteElection)

export default router
