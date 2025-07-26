import express from 'express';
import { createElection, getAllElections } from '../controllers/electionController.js';
import  auth  from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/', auth, authorizeRoles('admin'), createElection);
router.get('/', auth, getAllElections); 

export default router;
