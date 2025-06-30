import express from 'express';
import {
  createProductList,
  getProductListsByBranch,
  addProductToList,
  removeProductFromList,
  deleteProductList,
} from '../controllers/productListController.js';

const productListRoutes = express.Router();

productListRoutes.post('/', createProductList);
productListRoutes.get('/branch/:branchId', getProductListsByBranch);
productListRoutes.put('/:listId/add/:productId', addProductToList);
productListRoutes.put('/:listId/remove/:productId', removeProductFromList);
productListRoutes.delete('/:listId', deleteProductList);

export default productListRoutes;
