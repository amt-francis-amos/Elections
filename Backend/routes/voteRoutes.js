import express from 'express';
import { 
  castVote, 
  getResults, 
  getCandidates, 
  getUserVote  
} from '../controllers/voteController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/:electionId/candidates', auth, getCandidates);


router.get('/:electionId/user-vote', auth, getUserVote);


router.post('/', auth, castVote);


router.get('/:electionId/results', auth, getResults);

export default router;