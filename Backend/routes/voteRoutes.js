// routes/voteRoutes.js

import express from 'express';
import { castVote, getResults } from '../controllers/voteController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/', auth, castVote);


router.get('/:electionId/results', auth, authorizeRoles('admin'), getResults);

export default router;
