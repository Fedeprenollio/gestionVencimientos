
// controllers/expirationListController.js

import ExpirationList from "../models/ExpirationList.js";
import Branch from "../models/Branch.js";
import Lot from "../models/Lot.js";

// ============================================================
// CREAR UNA LISTA DE VENCIMIENTOS
// ============================================================
export const createExpirationList = async (req, res) => {
    console.log("HOLA LISTA")
  const { name, branch, description = "" } = req.body;

  if (!name || !branch) {
    return res.status(400).json({
      message: "El nombre y la sucursal son obligatorios",
    });
  }

  try {
    // Verificar que la sucursal exista
    const branchExists = await Branch.findById(branch);

    if (!branchExists) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    // Normalizamos el nombre
    const normalizedName = name.trim();

    if (!normalizedName) {
      return res.status(400).json({
        message: "El nombre de la lista no puede estar vacío",
      });
    }

    // Evitar duplicados dentro de la misma sucursal
    const existingList = await ExpirationList.findOne({
      branch,
      name: normalizedName,
    });

    if (existingList) {
      return res.status(409).json({
        message: "Ya existe una lista con ese nombre en esta sucursal",
        list: existingList,
      });
    }

    const newList = new ExpirationList({
      name: normalizedName,
      branch,
      description: description.trim(),
      createdBy: req.user?._id,
    });

    await newList.save();

    await newList.populate([
      {
        path: "branch",
        select: "name",
      },
      {
        path: "createdBy",
        select: "fullname username",
      },
    ]);

    res.status(201).json({
      message: "Lista de vencimientos creada",
      list: newList,
    });
  } catch (err) {
    console.error("Error al crear lista de vencimientos:", err);

    // Por si MongoDB detecta el índice unique
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una lista con ese nombre en esta sucursal",
      });
    }

    res.status(500).json({
      message: "Error al crear lista de vencimientos",
    });
  }
};

// ============================================================
// OBTENER TODAS LAS LISTAS DE UNA SUCURSAL
// ============================================================
export const getExpirationListsByBranch = async (req, res) => {
  const { branchId } = req.params;

  if (!branchId) {
    return res.status(400).json({
      message: "Falta el ID de la sucursal",
    });
  }

  try {
    const lists = await ExpirationList.find({
      branch: branchId,
      active: true,
    })
      .populate("branch", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      lists,
    });
  } catch (err) {
    console.error("Error al obtener listas:", err);

    res.status(500).json({
      message: "Error al obtener listas de vencimientos",
    });
  }
};

// ============================================================
// OBTENER UNA LISTA POR ID
// ============================================================
export const getExpirationListById = async (req, res) => {
  const { id } = req.params;

  try {
    const list = await ExpirationList.findById(id)
      .populate("branch", "name")
      .populate("createdBy", "fullname username");

    if (!list) {
      return res.status(404).json({
        message: "Lista de vencimientos no encontrada",
      });
    }

    const lots = await Lot.find({
      expirationLists: id,
    })
      .populate("productId", "name barcode type")
      .populate("branch", "name")
      .populate("createdBy", "fullname username")
      .sort({ expirationDate: 1, createdAt: -1 });

    res.status(200).json({
      list,
      lots,
    });
  } catch (err) {
    console.error("Error al obtener lista de vencimientos:", err);

    res.status(500).json({
      message: "Error al obtener lista de vencimientos",
    });
  }
};

// ============================================================
// DESACTIVAR UNA LISTA
// ============================================================
export const deactivateExpirationList = async (req, res) => {
  const { id } = req.params;

  try {
    const list = await ExpirationList.findById(id);

    if (!list) {
      return res.status(404).json({
        message: "Lista de vencimientos no encontrada",
      });
    }

    list.active = false;

    await list.save();

    res.status(200).json({
      message: "Lista de vencimientos desactivada",
      list,
    });
  } catch (err) {
    console.error("Error al desactivar lista:", err);

    res.status(500).json({
      message: "Error al desactivar lista de vencimientos",
    });
  }
};


