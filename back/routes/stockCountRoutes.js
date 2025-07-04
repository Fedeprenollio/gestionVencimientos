
// routes/stockCountRoutes.js
import express from "express";
import { addScannedProduct } from "../controllers/stockCountController.js";

const stockCounterRouter = express.Router();

stockCounterRouter.post("/:listId/add-product", addScannedProduct);
// luego podés agregar GET para ver la lista, DELETE, etc.

export default stockCounterRouter;
