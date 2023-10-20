import { Router } from 'express';
import multer from 'multer';

import {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} from './controller/index.js';

const router = Router();

router.route('/').post(multer().single('image'), addProduct).get(getProducts);

router
  .route('/:id')
  .get(getProductById)
  .patch(updateProductById)
  .delete(deleteProductById);

export default router;
