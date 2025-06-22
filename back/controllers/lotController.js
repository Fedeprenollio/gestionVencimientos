// controllers/lotController.js
import Product from "../models/Product.js";
import Lot from "../models/Lot.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// export const addLot = async (req, res) => {
//   const { barcode, expirationDate, quantity, branch } = req.body;

//   console.log("barcode, expirationDate, quantity, branch",barcode, expirationDate, quantity, branch)

//   if (!barcode || !expirationDate || !quantity || !branch) {
//     return res.status(400).json({ message: 'Faltan campos obligatorios para agregar lotes' });
//   }

//   try {
//     const product = await Product.findOne({ barcode });
//     if (!product) {
//       return res.status(404).json({ message: 'Producto no encontrado' });
//     }

//     const lot = new Lot({
//       productId: product._id,
//       expirationDate,
//       quantity,
//       branch,
//     });

//     await lot.save();

//     res.status(201).json({ message: 'Lote agregado', lot });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error al agregar lote' });
//   }
// };

export const addLot = async (req, res) => {
  const { productId, expirationDate, quantity, branch } = req.body;
  console.log("CREANDO LTE", productId, expirationDate, quantity, branch);
  if (!productId || !expirationDate || !quantity || !branch) {
    return res
      .status(400)
      .json({ message: "Faltan campos obligatorios para agregar lotes" });
  }
  const parsedExpirationDate = dayjs
    .tz(expirationDate, "America/Argentina/Buenos_Aires")
    .startOf("month") // si querés normalizar al inicio del mes
    .utc()
    .toDate();
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const lot = new Lot({
      productId,
      expirationDate: parsedExpirationDate,
      quantity,
      branch,
    });

    await lot.save();
    res.status(201).json({ message: "Lote agregado", lot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al agregar lote" });
  }
};

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
  console.log("req.query;", req.query);
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

    const lots = await Lot.find(filter).populate("productId");

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
    const lots = await Lot.find({ productId: productId }).sort({
      expirationDate: 1,
    });
    console.log("VIENDO LOTES", productId);

    res.json(lots);
  } catch (err) {
    console.error("Error al obtener lotes por producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
