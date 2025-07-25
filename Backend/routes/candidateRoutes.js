import express from 'express';
import { addCandidate, getCandidatesByElection } from '../controllers/candidateController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin'), addCandidate);
router.get('/:electionId', authenticateToken, getCandidatesByElection);

export default router;
