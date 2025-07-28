import express from 'express';
import { castVote, getResults } from '../controllers/voteController.js';
import auth from '../middlewares/auth.js';


const router = express.Router();

router.post('/', auth, castVote);


router.get('/:electionId/results', auth, getResults);

export default router;
