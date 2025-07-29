import express from 'express';
import {
   addCandidate,
   getCandidatesByElection,
   updateCandidate,
   updateCandidateImage,
   deleteCandidate,
   getAllElections
} from '../controllers/candidateController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Candidate CRUD operations
router.post('/', auth, authorizeRoles('admin'), upload.single('image'), addCandidate);
router.get('/election/:electionId', auth, authorizeRoles('admin'), getCandidatesByElection);
router.put('/:id', auth, authorizeRoles('admin'), updateCandidate);
router.put('/:id/image', auth, authorizeRoles('admin'), upload.single('image'), updateCandidateImage);
router.delete('/:id', auth, authorizeRoles('admin'), deleteCandidate);

// Elections endpoint for candidate forms
router.get('/elections', auth, authorizeRoles('admin'), getAllElections);

export default router;