// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  deleteProduct,
  getExpiringProducts,
  getExpiringProductsLotesComoString,
  getPriceHistory,
  getProductByBarcode,
  getProductsWithoutPrice,
  importProducts,
  searchProductsByName,
  updateProduct,
  updateProductPrices,  
} from '../controllers/productController.js';
import Product from '../models/Product.js';
import { getPriceHistoryByProduct } from '../controllers/historyPruceController.js';

const productRoutes = express.Router();
productRoutes.get('/', getExpiringProducts);
// getExpiringProductsLotesComoString
productRoutes.get('/lotesComoString', getExpiringProductsLotesComoString);

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

// GET /products/by-codebars?codebars=123,456,789
productRoutes.post("/by-codebars", async (req, res) => {
  try {
    const { codebars } = req.body;

    if (!Array.isArray(codebars) || codebars.length === 0) {
      return res.status(400).json({ message: "Se requiere un array de codebars." });
    }

    const products = await Product.find({
      barcode: { $in: codebars },
    });

    res.json(products);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

productRoutes.get('/price-history/:barcode', getPriceHistoryByProduct);


export default productRoutes;
