import express from "express";
import {
  createReturnList,
  addLotsToReturnList,
  getReturnListsByBranch,
  getReturnLists,
} from "../controllers/returnListController.js";
import { authenticate } from "../middlewares/auth.js";

const returnListRoutes = express.Router();
returnListRoutes.get("/", getReturnLists );
returnListRoutes.get("/branch", getReturnListsByBranch);
returnListRoutes.post("/",authenticate, createReturnList);
returnListRoutes.patch("/:id/returns", addLotsToReturnList);

export default returnListRoutes;



