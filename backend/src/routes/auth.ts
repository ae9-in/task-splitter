import { Router } from 'express';
import { login, logout, verifySession } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifySession);

export default router;
