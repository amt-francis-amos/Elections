import express from 'express';
import { castVote, getResults } from '../controllers/voteController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/', authenticateToken, castVote);


router.get('/:electionId/results', authenticateToken, authorizeRoles('admin'), getResults);

export default router;
