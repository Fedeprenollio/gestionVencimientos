import express from "express";
import {
  createReturnList,
  addLotsToReturnList,
  getReturnListsByBranch,
  getReturnLists,
  getReturnListById,
} from "../controllers/returnListController.js";
import { authenticate } from "../middlewares/auth.js";

const returnListRoutes = express.Router();
returnListRoutes.get("/:id", getReturnListById);
returnListRoutes.get("/", getReturnLists );
returnListRoutes.get("/branch", getReturnListsByBranch);
returnListRoutes.post("/",authenticate, createReturnList);
returnListRoutes.patch("/:id/returns", addLotsToReturnList);


export default returnListRoutes;



