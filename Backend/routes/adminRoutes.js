import express from 'express';
import { promoteToAdmin, deleteUser } from '../controllers/adminController.js';
import { auth } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.post('/promote', auth, authorizeRoles('admin'), promoteToAdmin);
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser);

export default router;