// routes/stockImportRoutes.js
import express from "express";
import multer from "multer";
import { applyStockImport, compareStockImport, importStock, listStockImports, updateAlternateBarcodesFromExcel } from "../controllers/stockImportController.js";
import StockImport from "../models/StockImport.js";
import { applyImportToBarcodes, updateFromImport, updateFromStockImport } from "../controllers/productList/updateFromStockImport.js";

const router = express.Router();
const upload = multer(); // Para leer el buffer

router.get("/compare-stock/:importId", compareStockImport);
router.post("/import-stock", upload.single("file"), importStock);

router.post("/productos/actualizar-codigos", upload.single("file"), updateAlternateBarcodesFromExcel);

router.get("/", listStockImports);
// router.post("/apply-to-lists", applyStockImport);
router.post("/apply-to-lists", updateFromStockImport);
router.post("/apply-to-products", applyImportToBarcodes);

//ya no lo usaria mas por que lo haria applyImportToBarcodes
router.get("/latestApplied", updateFromImport);

// routes/import.routes.js
router.get("/recent", async (req, res) => {
  try {
    const recent = await StockImport.find()
      .sort({ importedAt: -1 })
      .limit(10)
      .select("_id branch user importedAt status"); // ⛔ omitimos rows

    res.json(recent);
  } catch (err) {
    console.error("Error al obtener recientes:", err);
    res.status(500).json({ message: "Error al obtener las importaciones recientes" });
  }
});


export default router;
