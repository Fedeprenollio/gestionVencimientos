import express from 'express';
import { addLotToProduct, addOrUpdateProduct, deleteLot, getExpiringProducts, getProductByBarcode, searchProductsByName } from '../controllers/productController.js';

const router = express.Router();


router.get("/search", searchProductsByName);
router.get('/:barcode', getProductByBarcode);
router.get('/', getExpiringProducts);
router.post('/', addOrUpdateProduct);
router.patch('/add-lot', addLotToProduct); // nueva ruta

router.delete('/:productId/lots/:lotId', deleteLot);
export default router;
