import { Router } from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} from './controller';

const router = Router();

router.route('/').post(addProduct).get(getProducts);

router
  .route('/:id')
  .get(getProductById)
  .patch(updateProductById)
  .delete(deleteProductById);

export default router;
