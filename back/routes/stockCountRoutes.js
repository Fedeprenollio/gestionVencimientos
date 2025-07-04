// routes/stockCountRoutes.js
import express from "express";
import {
  createStockCountList,
  getAllStockCountLists,
  getStockCountListById,
  addProductToStockCountList,
  deleteStockCountList,
  removeProductFromStockCountList,
  getStockCountListsByBranch,
  updateListStock,
} from "../controllers/stockCountController.js";

const router = express.Router();

// Crear una nueva lista de recuento
router.post("/", createStockCountList);

// Obtener todas las listas (con filtros opcionales por branch o usuario)
router.get("/", getAllStockCountLists);

// Obtener una lista por ID
router.get("/:id", getStockCountListById);

// Agregar producto (acumulativo) a una lista por barcode
router.post("/:listId/add-product", addProductToStockCountList);

// Eliminar un producto específico de la lista
router.delete(
  "/:id/remove-product/:productId",
  removeProductFromStockCountList
);

// Eliminar una lista completa
router.delete("/:id", deleteStockCountList);

// Nueva ruta para obtener listas por sucursal
router.get("/branch/:branchId", getStockCountListsByBranch);


router.put("/:listId", updateListStock);
export default router;
