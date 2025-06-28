// controllers/lotController.js
import Product from "../models/Product.js";
import Lot from "../models/Lot.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// export const addLot = async (req, res) => {
//   const { productId, expirationDate, quantity, branch, overstock = false } = req.body;
//   console.log("CREANDO LOTE", productId, expirationDate, quantity, branch, overstock);

//   if (!productId || !expirationDate || !quantity || !branch) {
//     return res
//       .status(400)
//       .json({ message: "Faltan campos obligatorios para agregar lotes" });
//   }

//   // Parse expirationDate in Argentina timezone, normalize to month start
//   const parsedExpirationDate = dayjs
//     .tz(expirationDate, "America/Argentina/Buenos_Aires")
//     .startOf("month")
//     .utc()
//     .toDate();

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }

//     const lot = new Lot({
//       productId,
//       expirationDate: parsedExpirationDate,
//       quantity,
//       branch,
//       overstock: Boolean(overstock), // flag this lot as overstock
//     });

//     await lot.save();
//     res.status(201).json({ message: "Lote agregado", lot });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error al agregar lote" });
//   }
// };

export const addLot = async (req, res) => {
  const {
    productId,
    expirationDate,
    quantity,
    branch,
    overstock = false,
  } = req.body;

  if (!productId || !expirationDate || !quantity || !branch) {
    return res
      .status(400)
      .json({ message: "Faltan datos requeridos del lote" });
  }

  try {
    // Validar producto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Normalizar fecha
    const parsedExpirationDate = dayjs
      .tz(expirationDate, "America/Argentina/Buenos_Aires")
      .startOf("month")
      .utc()
      .toDate();

    // Buscar si ya existe (teniendo en cuenta overstock)
    const existingLot = await Lot.findOne({
      productId,
      expirationDate: parsedExpirationDate,
      branch,
      overstock: Boolean(overstock),
    });

    // if (existingLot) {
    //   existingLot.quantity += Number(quantity);
    //   await existingLot.save();
    //   return res
    //     .status(200)
    //     .json({ message: "Cantidad actualizada", lot: existingLot });
    // }
    console.log("USERRRR,", req.user);
    // Si no existe, crear nuevo lote
    const newLot = new Lot({
      productId,
      expirationDate: parsedExpirationDate,
      quantity,
      branch,
      overstock: Boolean(overstock),
      createdBy: req.user._id,
    });

    await newLot.save();
    await newLot.populate([
      { path: "productId", select: "name barcode type" },
      { path: "createdBy", select: "fullname username" },
    ]);

    res.status(201).json({ message: "Lote creado", lot: newLot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear lote" });
  }
};

// export const addLot = async (req, res) => {
//   const { productId, expirationDate, quantity, branch, overstock = false } = req.body;

//   if (!productId || !expirationDate || !quantity || !branch) {
//     return res.status(400).json({ message: "Faltan datos requeridos del lote" });
//   }

//   try {
//     // Validar producto
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Producto no encontrado" });
//     }

//     // Normalizar fecha
//     const parsedExpirationDate = dayjs
//       .tz(expirationDate, "America/Argentina/Buenos_Aires")
//       .startOf("month")
//       .utc()
//       .toDate();

//     // Buscar si ya existe
//     const existingLot = await Lot.findOne({
//       productId,
//       expirationDate: parsedExpirationDate,
//       branch,
//     });

//     if (existingLot) {
//       existingLot.quantity += Number(quantity);
//       await existingLot.save();
//       return res.status(200).json({ message: "Cantidad actualizada", lot: existingLot });
//     }

//     const newLot = new Lot({
//       productId,
//       expirationDate: parsedExpirationDate,
//       quantity,
//       branch,
//       overstock: Boolean(overstock),
//     });

//     await newLot.save();
//     res.status(201).json({ message: "Lote creado", lot: newLot });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error al crear lote" });
//   }
// };

export const deleteLot = async (req, res) => {
  const { lotId } = req.params;

  try {
    const result = await Lot.findByIdAndDelete(lotId);
    if (!result) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    res.json({ message: "Lote eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar el lote" });
  }
};

// Listar productos con lotes próximos a vencer
export const getExpiringLots = async (req, res) => {
  const { from, months = 6, branch, type, createdFrom, createdTo } = req.query;

  try {
    const fromDate = dayjs
      .tz(from || dayjs(), "America/Argentina/Buenos_Aires")
      .startOf("month")
      .utc()
      .toDate();

    const untilDate = dayjs(fromDate).add(Number(months), "month").toDate();

    const createdCriteria = {};
    if (createdFrom) {
      createdCriteria.$gte = dayjs
        .tz(createdFrom, "America/Argentina/Buenos_Aires")
        .startOf("day")
        .utc()
        .toDate();
    }
    if (createdTo) {
      createdCriteria.$lte = dayjs
        .tz(createdTo, "America/Argentina/Buenos_Aires")
        .endOf("day")
        .utc()
        .toDate();
    }

    const filter = {
      expirationDate: { $gte: fromDate, $lt: untilDate },
      ...(branch && { branch }),
      ...(Object.keys(createdCriteria).length > 0 && {
        createdAt: createdCriteria,
      }),
    };

    const lots = await Lot.find(filter).populate([
      { path: "productId", select: "name barcode type" },
      { path: "createdBy", select: "fullname username" },
    ]);

    // Si se filtra por tipo, lo hacemos después del populate
    const filteredLots = type
      ? lots.filter((lot) => lot.productId?.type === type)
      : lots;

    res.json(filteredLots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener lotes" });
  }
};

export const getLotsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const lots = await Lot.find({ productId: productId })
      .sort({
        expirationDate: 1,
      })
      .populate("createdBy", "username");

    console.log("VIENDO LOTES", productId);

    res.json(lots);
  } catch (err) {
    console.error("Error al obtener lotes por producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateLot = async (req, res) => {
  const { lotId } = req.params;
  const { quantity, expirationDate, branch, overstock } = req.body;

  try {
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    // Si se pasa fecha, la normalizamos al inicio del mes en UTC
    if (expirationDate) {
      lot.expirationDate = dayjs
        .tz(expirationDate, "America/Argentina/Buenos_Aires")
        .startOf("month")
        .utc()
        .toDate();
    }

    if (quantity !== undefined) lot.quantity = quantity;
    if (branch) lot.branch = branch;
    if (typeof overstock === "boolean") lot.overstock = overstock;

    await lot.save();

    await lot.populate([
      { path: "productId", select: "name barcode type" },
      { path: "createdBy", select: "fullname username" },
    ]);

    const populatedLot = {
      ...lot.toObject(),
      product: lot.productId,
    };

    res.json({ message: "Lote actualizado", lot: populatedLot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar el lote" });
  }
};
