import { Router } from 'express';
import { addProduct, getProducts, getProductById } from './controller';

const router = Router();

router.route('/').post(addProduct).get(getProducts);

router.route('/:id').get(getProductById);

export default router;
