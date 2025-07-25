
import express from 'express';
import { getCandidatesByElection, addCandidate } from '../controllers/candidateController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.get('/candidates/:electionId', authMiddleware, getCandidatesByElection);
router.post('/candidates', authMiddleware, upload.single('image'), addCandidate);

export default router;
