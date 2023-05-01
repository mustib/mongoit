import { Router } from 'express';
import { addProduct } from './controller';

const router = Router();

router.route('/').post(addProduct);

export default router;
