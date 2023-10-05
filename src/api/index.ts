import { Router } from 'express';
import { productRouter } from './product/index.js';
import { userRouter } from './user/index.js';

const router = Router();

router.use('/products', productRouter);
router.use('/users', userRouter);

export default router;
