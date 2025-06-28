import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { login, register } from "../controllers/authController.js";

const userRoutes = express.Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/register", register);
userRoutes.post("/login", login);


export default userRoutes;
