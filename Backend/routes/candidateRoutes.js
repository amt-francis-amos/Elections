
import express from 'express';
import { getCandidatesByElection, addCandidate } from '../controllers/candidateController.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.get('/candidates/:electionId',  authenticateToken, getCandidatesByElection);
router.post('/candidates',  authenticateToken, upload.single('image'), addCandidate);

export default router;
