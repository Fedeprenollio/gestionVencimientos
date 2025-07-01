import express from 'express';
import {
  createProductList,
  getProductListsByBranch,
  addProductToList,
  removeProductFromList,
  deleteProductList,
  getProductListById,
  getQuickProducts,
  addQuickProducts,
  updateQuickProducts,
  clearQuickProducts,
  comparePricesByDate,
  uploadPricesForList,
} from '../controllers/productListController.js';
import { comparePricesByDateSeparateCollections } from '../controllers/historyPruceController.js';

const productListRoutes = express.Router();

productListRoutes.post('/', createProductList);
productListRoutes.get('/:id', getProductListById); // <-- NUEVA RUTA
productListRoutes.get('/branch/:branchId', getProductListsByBranch);
productListRoutes.put('/:listId/add/:productId', addProductToList);
productListRoutes.put('/:listId/remove/:productId', removeProductFromList);
productListRoutes.delete('/:listId', deleteProductList);
// routes/productListRoutes.js
productListRoutes.get("/:id/compare-prices", comparePricesByDateSeparateCollections);

// productListRoutes.get("/:id/compare-prices", comparePricesByDate);
productListRoutes.post("/:listId/upload-prices", uploadPricesForList);

productListRoutes.get("/:listId/quick-products", getQuickProducts);
productListRoutes.put("/:listId/quick-products", addQuickProducts);
productListRoutes.put("/:id/quick-products", updateQuickProducts);
productListRoutes.delete("/:id/quick-products", clearQuickProducts ); // <- esta es la nueva

export default productListRoutes;
