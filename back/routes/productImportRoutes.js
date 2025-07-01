import express from "express";
import multer from "multer";
import { importProducts } from "../controllers/productController.js";

const importRouter = express.Router();
const upload = multer(); // sin configuración guarda en memoria

importRouter.post("/import", upload.single("file"), importProducts);

export default importRouter;
