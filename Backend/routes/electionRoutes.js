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


router.post('/', auth, authorizeRoles('admin'), createElection);
router.get('/', auth, getAllElections);
router.get('/:id', auth, getElectionById);
router.put('/:id', auth, authorizeRoles('admin'), updateElection);
router.delete('/:id', auth, authorizeRoles('admin'), deleteElection);

export default router;