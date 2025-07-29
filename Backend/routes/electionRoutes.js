
import express from 'express';
import { 
  createElection, 
  getAllElections, 
  updateElection, 
  deleteElection, 
  getElectionById 
} from '../controllers/electionController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.post('/elections', auth, authorizeRoles('admin'), createElection);
router.get('/elections', auth, getAllElections);
router.get('/elections/:id', auth, getElectionById);
router.put('/elections/:id', auth, authorizeRoles('admin'), updateElection);
router.delete('/elections/:id', auth, authorizeRoles('admin'), deleteElection);


export default router;