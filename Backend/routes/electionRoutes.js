import express from 'express';
import { createElection, getAllElections } from '../controllers/electionController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/', authenticateToken, authorizeRoles('admin'), createElection);
router.get('/', authenticateToken, getAllElections); 

export default router;
