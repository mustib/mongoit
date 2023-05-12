import { Router } from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
} from './controller';

const router = Router();

router.route('/').post(addProduct).get(getProducts);

router.route('/:id').get(getProductById).patch(updateProduct);

export default router;
