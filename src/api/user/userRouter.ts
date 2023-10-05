import { Router } from 'express';
import { signUp, signIn, verifyEmail } from './controller/index.js';

const router = Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);

router.get('/email/verify/:token', verifyEmail);

export default router;
