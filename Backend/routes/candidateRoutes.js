import express from 'express';
import { 
  addCandidate, 
  getAllCandidates,  
  getCandidatesByElection, 
  updateCandidate, 
  updateCandidateImage, 
  deleteCandidate,
  getPublicCandidatesForElection  
} from '../controllers/candidateController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import upload from '../middlewares/multer.js'; 

const router = express.Router();

// Admin-only routes
router.get('/', auth, authorizeRoles('admin'), getAllCandidates);
router.post('/', auth, authorizeRoles('admin'), upload.single('image'), addCandidate);
router.get('/election/:electionId', auth, authorizeRoles('admin'), getCandidatesByElection);
router.put('/:id', auth, authorizeRoles('admin'), updateCandidate);
router.put('/:id/image', auth, authorizeRoles('admin'), upload.single('image'), updateCandidateImage);
router.delete('/:id', auth, authorizeRoles('admin'), deleteCandidate);


router.get('/public/election/:electionId', auth, getPublicCandidatesForElection);

export default router;