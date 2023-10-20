import express from 'express';
import envVars from '../config/envVars.js';

const router = express.Router();

router.use('/products', express.static(envVars.PRODUCTS_STATIC_PATH));

export default router;
