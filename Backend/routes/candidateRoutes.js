
import express from 'express';
import { getCandidatesByElection, addCandidate } from '../controllers/candidateController.js';
import  auth  from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.get('/candidates/:electionId',  auth, getCandidatesByElection);
router.post('/candidates',  auth, upload.single('image'), addCandidate);

export default router;
