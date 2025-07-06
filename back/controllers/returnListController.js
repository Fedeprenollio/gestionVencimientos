import Lot from "../models/Lot.js";
import Product from "../models/Product.js";
import ReturnList from "../models/ReturnList.js";

export const createReturnList = async (req, res) => {
  const { branch, month, year, lotIds } = req.body;
  const userId = req.user._id;

  if (!branch || !month || !year) {
    return res
      .status(400)
      .json({ message: "Faltan datos: branch, month o year" });
  }

  try {
    const newList = await ReturnList.create({
      branch,
      // createdBy: userId,
      month,
      year,
      lots: lotIds || [],
    });

    res.status(201).json(newList);
  } catch (err) {
    console.error("Error al crear devolución:", err);
    res.status(500).json({ message: "Error al crear devolución" });
  }
};

export const addLotsToReturnList = async (req, res) => {
  const { id } = req.params;
  const { returns } = req.body; // [{ barcode, quantity }]
  // const userId = req.user._id; // Asumido desde middleware auth

  try {
    const list = await ReturnList.findById(id);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const addedLotsSet = new Set();
    const scannedReturnsToAdd = [];

    for (const { barcode, quantity } of returns) {
      let qtyToDeduct = quantity;

      // Buscar producto por barcode
      const product = await Product.findOne({ barcode });
      if (!product) {
        console.warn(`Producto no encontrado para barcode ${barcode}`);
        continue;
      }

      // Buscar lotes con stock en la sucursal ordenados por fecha de vencimiento asc
      const candidateLots = await Lot.find({
        productId: product._id,
        branch: list.branch,
        quantity: { $gt: 0 },
      }).sort({ expirationDate: 1 });

      for (const lot of candidateLots) {
        if (qtyToDeduct <= 0) break;

        const deduct = Math.min(lot.quantity, qtyToDeduct);
        lot.quantity -= deduct;

        await lot.save();

        addedLotsSet.add(lot._id.toString());

        // Guardar la devolución en scannedReturns para el historial
        scannedReturnsToAdd.push({
          barcode,
          quantity: deduct,
          loteId: lot._id,
          scannedAt: new Date(),
          // userId,
        });

        qtyToDeduct -= deduct;
      }

      if (qtyToDeduct > 0) {
        console.warn(
          `No se pudo deducir toda la cantidad para producto ${barcode}, falta ${qtyToDeduct} unidades`
        );
        // Opcional: podrías enviar esto al frontend para mostrar alerta
      }
    }

    // Actualizar lotes en la lista (sin duplicados)
    await ReturnList.findByIdAndUpdate(id, {
      $addToSet: { lots: { $each: Array.from(addedLotsSet) } },
      $push: { scannedReturns: { $each: scannedReturnsToAdd } },
    });
const addedLots = await Lot.find({ _id: { $in: Array.from(addedLotsSet) } })
  .populate("productId", "name barcode") // solo traés el nombre y código de barras
  .lean();
    res.json({
      message: "Lotes y devoluciones actualizados correctamente",
      // addedLots: Array.from(addedLotsSet),
      addedLots,
      addedReturnsCount: scannedReturnsToAdd.length,
    });
  } catch (err) {
    console.error("Error al actualizar lotes y devoluciones:", err);
    res.status(500).json({ message: "Error al actualizar lotes y devoluciones" });
  }
};

// export const addLotsToReturnList = async (req, res) => {
//   const { id } = req.params;
//   const { returns, userId, mode = "scanner", note = "" } = req.body;

//   try {
//     const list = await ReturnList.findById(id);
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     // Agregar lotes nuevos si no están
//     for (const r of returns) {
//       if (!list.lots.includes(r.loteId)) {
//         list.lots.push(r.loteId);
//       }
//     }

//     // Mapear para agregar info adicional y fecha
//     const scannedWithMeta = returns.map((r) => ({
//       barcode: r.barcode,
//       quantity: r.quantity,
//       loteId: r.loteId,
//       scannedAt: new Date(),
//       userId,
//       mode,
//       note,
//     }));

//     list.scannedReturns.push(...scannedWithMeta);

//     await list.save();

//     res.json({ message: "Devoluciones añadidas correctamente", list });
//   } catch (error) {
//     console.error("Error agregando devoluciones:", error);
//     res.status(500).json({ message: "Error al guardar devoluciones" });
//   }
// };

export const getReturnListsByBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const lists = await ReturnList.find({ branch: branchId })
      .populate("createdBy", "username fullname")
      .populate("branch", "name")
      .populate("lots") // si querés datos de lotes
      .populate("scannedReturns.loteId") // popular lote de cada escaneo
      .populate("scannedReturns.userId", "username fullname") // popular usuario si guardas
      .lean()
      .sort({ createdAt: -1 });
    // .populate("createdBy", "username fullname")
    // .populate({
    //   path: "lots",
    //   populate: {
    //     path: "productId",
    //     select: "name barcode",
    //   },
    // })
    // .sort({ createdAt: -1 });

    res.json(lists);
  } catch (err) {
    console.error("Error al obtener historial:", err);
    res.status(500).json({ message: "Error al obtener historial" });
  }
};

export const getReturnLists = async (req, res) => {
  const { branch, month, year } = req.query;
  console.log("branch, month, year", branch, month, year);
  try {
    const lists = await ReturnList.find({
      branch,
      month: Number(month),
      year: Number(year),
    })
      .populate("createdBy", "fullname username") // o los campos que necesites
      .populate({
        path: "lots",
        populate: {
          path: "productId",
          select: "name barcode",
        },
      })
      .lean();

    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener listas" });
  }
};
