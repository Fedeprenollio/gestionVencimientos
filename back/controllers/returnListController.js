import Lot from "../models/Lot.js";
import Product from "../models/Product.js";
import ReturnList from "../models/ReturnList.js";

export const createReturnList = async (req, res) => {
  const { branch, month, year, lotIds, name } = req.body;
  const userId = req.user._id;

  if (!branch || !month || !year) {
    return res
      .status(400)
      .json({ message: "Faltan datos: branch, month o year" });
  }

  try {
    const newList = await ReturnList.create({
      branch,
      createdBy: userId,
      month,
      year,
      lots: lotIds || [],
      name,
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
  try {
    const list = await ReturnList.findById(id);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const addedLotsSet = new Set();
    const scannedReturnsToAdd = [];

    for (const { barcode, quantity } of returns) {
      let qtyToDeduct = quantity;

      const product = await Product.findOne({ barcode });
      if (!product) continue;

      const candidateLots = await Lot.find({
        productId: product._id,
        branch: list.branch,
      }).sort({ expirationDate: 1 });

      for (const lot of candidateLots) {
        if (qtyToDeduct <= 0) break;

        // 🔍 Calcular cuánto ya fue devuelto de este lote
        const totalPrevReturns = await ReturnList.aggregate([
          { $unwind: "$scannedReturns" },
          {
            $match: {
              "scannedReturns.loteId": lot._id,
            },
          },
          {
            $group: {
              _id: "$scannedReturns.loteId",
              total: { $sum: "$scannedReturns.quantity" },
            },
          },
        ]);

        const alreadyReturned = totalPrevReturns[0]?.total || 0;
        const remaining = Math.max(0, lot.quantity - alreadyReturned);

        if (remaining <= 0) continue;

        const deduct = Math.min(remaining, qtyToDeduct);

        scannedReturnsToAdd.push({
          barcode,
          quantity: deduct,
          loteId: lot._id,
          scannedAt: new Date(),
        });

        addedLotsSet.add(lot._id.toString());
        qtyToDeduct -= deduct;
      }

      if (qtyToDeduct > 0) {
        console.warn(
          `No se pudo deducir toda la cantidad para ${barcode}, faltan ${qtyToDeduct} unidades`
        );
      }
    }

    await ReturnList.findByIdAndUpdate(id, {
      $addToSet: { lots: { $each: Array.from(addedLotsSet) } },
      $push: { scannedReturns: { $each: scannedReturnsToAdd } },
    });

    const addedLots = await Lot.find({
      _id: { $in: Array.from(addedLotsSet) },
    }).populate("productId", "name barcode");

    res.json({
      message: "Devoluciones registradas correctamente",
      addedLots,
      addedReturnsCount: scannedReturnsToAdd.length,
    });
  } catch (err) {
    console.error("Error al registrar devoluciones:", err);
    res.status(500).json({ message: "Error al registrar devoluciones" });
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
      .populate({
        path: "scannedReturns.loteId", // si querés que venga el lote con producto también
        populate: {
          path: "productId",
          select: "name barcode",
        },
      })
      .lean();

    // Calcular remainingQuantity para cada lote dentro de cada lista
    for (const list of lists) {
      if (list?.lots && list?.scannedReturns) {
        list.lots = list.lots.map((lot) => {
          const totalReturned = list.scannedReturns
            .filter(
              (r) => String(r.loteId?._id || r.loteId) === String(lot._id)
            )
            .reduce((acc, r) => acc + r.quantity, 0);

          return {
            ...lot,
            remainingQuantity: Math.max(0, lot.quantity - totalReturned),
          };
        });
      }
    }

    res.json(lists);
  } catch (error) {
    console.error("Error al obtener listas:", error);
    res.status(500).json({ message: "Error al obtener listas" });
  }
};

export const getReturnListById = async (req, res) => {
  const { id } = req.params;

  try {
    const list = await ReturnList.findById(id)
      .populate("createdBy", "fullname username")
      .populate({
        path: "lots",
        populate: {
          path: "productId",
          select: "name barcode",
        },
      })
      .populate({
        path: "scannedReturns.loteId",
        populate: {
          path: "productId", // 🔁 Esta es la parte clave
          select: "name barcode",
        },
      })
      .lean();

    console.log("LISTA", list);

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });
    if (list?.lots && list?.scannedReturns) {
      list.lots = list.lots.map((lot) => {
        const totalReturned = list.scannedReturns
          .filter((r) => String(r.loteId?._id || r.loteId) === String(lot._id))
          .reduce((acc, r) => acc + r.quantity, 0);

        return {
          ...lot,
          remainingQuantity: Math.max(0, lot.quantity - totalReturned),
        };
      });
    }

    res.json(list);
  } catch (error) {
    console.error("Error al obtener lista por ID:", error);
    res.status(500).json({ message: "Error al obtener la lista" });
  }
};

// PATCH /return-lists/:id/remove-scanned-return
export const removeScannedReturn = async (req, res) => {
  const { id } = req.params;
  const { scannedReturnIndex } = req.body;

  try {
    const list = await ReturnList.findById(id);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    if (
      scannedReturnIndex < 0 ||
      scannedReturnIndex >= list.scannedReturns.length
    ) {
      return res.status(400).json({ message: "Índice inválido" });
    }

    // Eliminar escaneo
    list.scannedReturns.splice(scannedReturnIndex, 1);
    await list.save();

    // Reunimos todos los loteIds aún usados
    const loteIds = [
      ...new Set(list.scannedReturns.map((r) => String(r.loteId))),
    ];

    // Sumamos los lotes originales que ya estaban guardados en la lista (opcional)
    const extraLots = list.lots.map((id) => String(id));
    const allLotIds = [...new Set([...loteIds, ...extraLots])];

    // Buscar los lotes
    const lots = await Lot.find({ _id: { $in: allLotIds } }).populate(
      "productId"
    );

    res.json({
      message: "Escaneo eliminado correctamente",
      scannedReturns: list.scannedReturns,
      lots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar escaneo" });
  }
};


export const getReturnsSummary = async (req, res) => {
  try {
    const { branch, month, year } = req.query;
console.log("branch",branch)
    if (!branch || !month || !year) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const lists = await ReturnList.find({
      branch,
      month: Number(month),
      year: Number(year),
    });

    const summaryMap = {};

    lists.forEach((list) => {
      list.scannedReturns.forEach((r) => {
        const loteId = r.loteId._id?.toString?.() || r.loteId.toString();
        summaryMap[loteId] = (summaryMap[loteId] || 0) + r.quantity;
      });
    });

    const result = Object.entries(summaryMap).map(([loteId, quantityReturned]) => ({
      loteId,
      quantityReturned,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en getReturnsSummary:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};