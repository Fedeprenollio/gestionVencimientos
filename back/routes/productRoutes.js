// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  deleteProduct,
  getExpiringProducts,
  getProductByBarcode,
  searchProductsByName,
  updateProduct,  
} from '../controllers/productController.js';

const productRoutes = express.Router();
productRoutes.get('/', getExpiringProducts);
productRoutes.get('/search', searchProductsByName);
productRoutes.get('/:barcode', getProductByBarcode);
productRoutes.post('/', createProduct);
productRoutes.delete("/:id", deleteProduct);
productRoutes.put("/:id", updateProduct);

export default productRoutes;
