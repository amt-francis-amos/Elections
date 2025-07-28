import express from 'express';
import { 
  promoteToAdmin, 
  deleteUser, 
  createVoter, 
  getAllVoters 
} from '../controllers/adminController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/promote', auth, authorizeRoles('admin'), promoteToAdmin);
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser);


router.post('/create-voter', auth, authorizeRoles('admin'), createVoter);
router.get('/voters', auth, authorizeRoles('admin'), getAllVoters);

export default router;