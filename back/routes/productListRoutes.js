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
  uploadPricesForMultipleLists,
  getProductsToRetag,
  getUploadLogsForList,
  getUploadLogs,
  addMultipleProductsToList,
  removeMultipleProductsFromList,
  updateTagDate,
  getProductsFromLists,
  getUploadLogsByBranch,
} from '../controllers/productListController.js';
import { comparePricesByDateSeparateCollections } from '../controllers/historyPruceController.js';
import ProductList from '../models/ProductList.js';
import { updateFromStockImport } from '../controllers/productList/updateFromStockImport.js';

const productListRoutes = express.Router();

productListRoutes.post('/', createProductList);

productListRoutes.get('/branch/:branchId', getProductListsByBranch);
productListRoutes.post('/products', getProductsFromLists); //<-- me trae todos los productos de las listas seleccionadas

productListRoutes.put('/:listId/add/:productId', addProductToList);
//CARGA MULTIPLE A LIST
productListRoutes.post('/:listId/add-multiple', addMultipleProductsToList);
//ELIMINAR MULTIPLE
productListRoutes.put("/:listId/remove-many", removeMultipleProductsFromList);


productListRoutes.put('/:listId/remove/:productId', removeProductFromList);
productListRoutes.delete('/:listId', deleteProductList);
// routes/productListRoutes.js
// productListRoutes.get("/:id/compare-prices", comparePricesByDateSeparateCollections);

// productListRoutes.get("/:id/compare-prices", comparePricesByDate);
productListRoutes.post("/:listId/upload-prices", uploadPricesForList);
productListRoutes.post("/upload-prices-multiple", uploadPricesForMultipleLists);

// routes/productLists.js (o similar)
productListRoutes.post("/:id/update-last-tag-date", async (req, res) => {
  const { id } = req.params;
  const { barcodes } = req.body;

  if (!Array.isArray(barcodes) || barcodes.length === 0) {
    return res.status(400).json({ message: "Se requieren códigos de barra." });
  }

  try {
    const list = await ProductList.findById(id).populate("products.product");
    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    const now = new Date();

    for (let i = 0; i < list.products.length; i++) {
      const item = list.products[i];
      if (barcodes.includes(item.product?.barcode)) {
        list.products[i].lastTagDate = now;
      }
    }

    await list.save();

    res.json({ message: "✅ Etiquetas marcadas correctamente", updated: barcodes.length });
  } catch (err) {
    console.error("Error al actualizar fechas de etiquetas:", err);
    res.status(500).json({ message: "❌ Error del servidor" });
  }
});

//CON PAGIACION
productListRoutes.get("/upload-logs/by-branch", getUploadLogsByBranch);
productListRoutes.get("/:listId/upload-logs", getUploadLogs);

productListRoutes.get('/:listId/compare-prices', comparePricesByDate);

productListRoutes.get('/:listId/products-to-retag', getProductsToRetag);
productListRoutes.get("/:listId/quick-products", getQuickProducts);
productListRoutes.put("/:listId/quick-products", addQuickProducts);
productListRoutes.put("/:id/quick-products", updateQuickProducts);
productListRoutes.delete("/:id/quick-products", clearQuickProducts ); // <- esta es la nueva
productListRoutes.patch("/lists/:listId/product/:productId/tag-date", updateTagDate);

productListRoutes.get('/:id', getProductListById); // <-- NUEVA RUTA

productListRoutes.post("/update-from-stock-import", updateFromStockImport);

export default productListRoutes;
