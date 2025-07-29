import express from 'express';
import { castVote, getResults, getCandidates } from '../controllers/voteController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();


router.get('/:electionId/candidates', auth, getCandidates);


router.post('/', auth, castVote);

router.get('/:electionId/results', auth, getResults);

export default router;