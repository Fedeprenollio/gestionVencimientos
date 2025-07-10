import express from "express";
import { bulkUpdateStock, getProductsWithStock, getStockByBranch, upsertStock } from "../controllers/stockController.js";

const routerStock = express.Router();

routerStock.post("/update", upsertStock);
routerStock.get("/by-branch/:branchId", getStockByBranch);
routerStock.get("/con-stock/:branchId", getProductsWithStock);
routerStock.post("/bulk-update", bulkUpdateStock);

export default routerStock;
