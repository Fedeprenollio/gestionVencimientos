import express from 'express';
import { createProduct, getExpiringProducts } from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getExpiringProducts);

export default router;
