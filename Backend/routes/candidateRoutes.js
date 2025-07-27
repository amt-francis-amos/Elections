import express from 'express';
import { addCandidate, getCandidatesByElection } from '../controllers/candidateController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.single('image'), addCandidate);
router.get('/:electionId', getCandidatesByElection);

export default router;
