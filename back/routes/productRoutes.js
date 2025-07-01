// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  deleteProduct,
  getExpiringProducts,
  getPriceHistory,
  getProductByBarcode,
  getProductsWithoutPrice,
  importProducts,
  searchProductsByName,
  updateProduct,
  updateProductPrices,  
} from '../controllers/productController.js';
import Product from '../models/Product.js';

const productRoutes = express.Router();
productRoutes.get('/', getExpiringProducts);
productRoutes.get('/without-price', getProductsWithoutPrice);
productRoutes.get('/search', searchProductsByName);
productRoutes.get('/:barcode', getProductByBarcode);
productRoutes.post('/', createProduct);
productRoutes.delete("/:id", deleteProduct);
productRoutes.put("/:id", updateProduct);
productRoutes.post("/import", importProducts);
productRoutes.post('/update-prices', updateProductPrices);
productRoutes.get('/:barcode/history', getPriceHistory);
productRoutes.post("/check-exist", async (req, res) => {
  const { barcodes } = req.body;

  try {
    const existing = await Product.find(
      { barcode: { $in: barcodes } },
      { barcode: 1, _id: 0 }
    ).lean();

    const existingBarcodes = existing.map((p) => p.barcode);
    res.json({ existingBarcodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error checking products" });
  }
});




export default productRoutes;
