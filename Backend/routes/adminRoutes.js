import express from 'express';
import { promoteToAdmin } from '../controllers/adminController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/promote', authenticateToken, authorizeRoles('admin'), promoteToAdmin);

export default router;
