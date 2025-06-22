// import express from 'express';
// import { addLotToProduct, addOrUpdateProduct, deleteLot, getExpiringProducts, getProductByBarcode, searchProductsByName } from '../controllers/productController.js';

// const router = express.Router();


// router.get("/search", searchProductsByName);
// router.get('/:barcode', getProductByBarcode);
// router.get('/', getExpiringProducts);
// router.post('/', addOrUpdateProduct);
// router.patch('/add-lot', addLotToProduct); // nueva ruta

// router.delete('/:productId/lots/:lotId', deleteLot);
// export default router;

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
