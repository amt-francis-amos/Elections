import express from 'express';
import { 
  castVote, 
  getResults, 
  getCandidates, 
  getUserVote,
  checkUserVotesInElection,
  getCandidateVoteCount,
  getAdminStats,
  getFinalResults,
  exportElectionResults,
  declareWinners,
  getWinnersDeclaration
} from '../controllers/voteController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/:electionId/candidates', auth, getCandidates);
router.get('/:electionId/user-vote', auth, getUserVote);
router.post('/', auth, castVote);
router.get('/:electionId/results', auth, getResults);
router.get('/:electionId/check-all', auth, checkUserVotesInElection);
router.get('/candidate/:candidateId/count', getCandidateVoteCount);
router.get('/admin/stats', auth, getAdminStats);
router.get('/results/:electionId', getResults);

router.get('/:electionId/final-results', auth, getFinalResults);
router.get('/:electionId/export', auth, exportElectionResults);
router.post('/:electionId/declare-winners', auth, declareWinners);
router.get('/:electionId/winners-declaration', getWinnersDeclaration);

export default router;