import express from 'express';
import mongoose from 'mongoose';
import { getCandidatesByElection, addCandidate } from '../controllers/candidateController.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

const validateElectionId = (req, res, next) => {
  const { electionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(electionId)) {
    return res.status(400).json({ message: 'Invalid election ID' });
  }
  next();
};

router.get('/candidates/:electionId', auth, validateElectionId, getCandidatesByElection);
router.post('/candidates', auth, upload.single('image'), addCandidate);

export default router;
