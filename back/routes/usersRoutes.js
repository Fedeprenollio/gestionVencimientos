import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { login, register } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const userRoutes = express.Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/register", authenticate ,register);
userRoutes.post("/login", login);


export default userRoutes;
