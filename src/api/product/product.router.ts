import { Router } from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './controller';

const router = Router();

router.route('/').post(addProduct).get(getProducts);

router
  .route('/:id')
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;
