import { Router } from 'express';
import { productRouter } from './product';
import { userRouter } from './user';

const router = Router();

router.use('/products', productRouter);
router.use('/users', userRouter);

export default router;
