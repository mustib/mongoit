import { Router } from 'express';
import { signUp, signIn } from './controller';

const router = Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);

export default router;
