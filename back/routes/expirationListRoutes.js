// routes/expirationListRoutes.js

import express from "express";

import {
  createExpirationList,
  getExpirationListsByBranch,
  getExpirationListById,
  deactivateExpirationList,
} from "../controllers/expirationListController.js";

const router = express.Router();

// Crear una lista
// POST /api/expiration-lists
router.post("/", createExpirationList);

// Obtener todas las listas activas de una sucursal
// GET /api/expiration-lists/branch/:branchId
router.get("/branch/:branchId", getExpirationListsByBranch);

// Obtener una lista específica
// GET /api/expiration-lists/:id
router.get("/:id", getExpirationListById);

// Desactivar una lista
// PATCH /api/expiration-lists/:id/deactivate
router.patch("/:id/deactivate", deactivateExpirationList);

export default router;

