import Product from "../models/Product.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Lot from "../models/Lot.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// export const createProduct = async (req, res) => {
// const { barcode, name, type, branch, expirationDate, quantity, productId } =
//   req.body;
// console.log(
//   "que viene?",
//   barcode,
//   name,
//   type,
//   branch,
//   expirationDate,
//   quantity,
//   productId
// );

// // if (!barcode || !name || !type || !branch || !expirationDate || !quantity) {
// //   return res.status(400).json({ message: "Faltan datos requeridos" });
// // }

// try {
//   let product = await Product.findOne({ barcode });

//   if (!product) {
//       if (!barcode || !name || !type) {
//     return res
//       .status(400)
//       .json({ message: "Faltan datos requeridos en el crear producto" });
//   }
//     // Crear nuevo producto
//     product = new Product({ barcode, name, type });
//     await product.save();
//   }

//   const parsedDate = new Date(expirationDate);
// if (isNaN(parsedDate.getTime())) {
//   return res.status(400).json({ message: "Fecha de vencimiento inválida" });
// }

//   // Buscar si ya hay un lote con mismo vencimiento y sucursal
//   const existingLot = await Lot.findOne({
//     product: product._id,
//     expirationDate: parsedDate,
//     branch,
//   });

//   if (existingLot) {
//     // Aumentar la cantidad
//     existingLot.quantity += Number(quantity);
//     await existingLot.save();
//   } else {
// if (!barcode || !name || !type || !branch || !expirationDate || !quantity) {
//   return res.status(400).json({ message: "Faltan datos requeridos" });
// }

//     // Crear nuevo lote
//     const newLot = new Lot({
//       product: product._id,
//       expirationDate:parsedDate,
//       quantity,
//       branch,
//     });
//     await newLot.save();
//   }

//   res
//     .status(200)
//     .json({ message: "Producto y lote procesados correctamente" });
// } catch (err) {
//   console.error(err);
//   res.status(500).json({ message: "Error del servidor" });
// }
// };

export const createProduct = async (req, res) => {
  const { barcode, name, type } = req.body;

  if (!barcode || !name || !type) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    let existing = await Product.findOne({ barcode });
    if (existing) {
      return res
        .status(200)
        .json({ message: "Producto ya existente", product: existing });
    }

    const product = new Product({ barcode, name, type });
    await product.save();

    res.status(201).json({ message: "Producto creado exitosamente", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const addLotToProduct = async (req, res) => {
  const { barcode, expirationDate, quantity, branch } = req.body;
  console.log(
    "ADD LOTE TO PRODUCT IN PRODUCT",
    barcode,
    expirationDate,
    quantity,
    branch
  );
  if (!barcode || !expirationDate || !quantity || !branch) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Agregar el nuevo lote
    product.lots.push({ expirationDate, quantity, branch });

    await product.save();

    res.status(200).json({ message: "Lote agregado", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al agregar lote" });
  }
};

// export const getExpiringProducts = async (req, res) => {
//   const { from, months = 6, branch, type, createdFrom, createdTo } = req.query;

//   // Convertir fechas a UTC partiendo de horario Argentina
//   const fromDate = dayjs
//     .tz(from || dayjs(), 'America/Argentina/Buenos_Aires')
//     .startOf('month')
//     .utc()
//     .toDate();

//   const untilDate = dayjs(fromDate).add(Number(months), 'month').toDate();

//   // Rango de creación (createdAt)
//   const createdCriteria = {};
//   if (createdFrom) {
//     createdCriteria.$gte = dayjs
//       .tz(createdFrom, 'America/Argentina/Buenos_Aires')
//       .startOf('day')
//       .utc()
//       .toDate();
//   }
//   if (createdTo) {
//     createdCriteria.$lte = dayjs
//       .tz(createdTo, 'America/Argentina/Buenos_Aires')
//       .endOf('day')
//       .utc()
//       .toDate();
//   }

//   // Filtro general
//   const match = { 'lots.expirationDate': { $gte: fromDate, $lt: untilDate } };
//   if (branch) match['lots.branch'] = branch;
//   if (type) match.type = type;

//   try {
//     const products = await Product.aggregate([
//       { $match: match },
//       {
//         $project: {
//           barcode: 1,
//           name: 1,
//           type: 1,
//           lots: {
//             $filter: {
//               input: '$lots',
//               as: 'lot',
//               cond: {
//                 $and: [
//                   { $gte: ['$$lot.expirationDate', fromDate] },
//                   { $lt: ['$$lot.expirationDate', untilDate] },
//                   ...(branch ? [{ $eq: ['$$lot.branch', branch] }] : []),
//                   ...(createdFrom || createdTo
//                     ? [
//                         {
//                           $and: [
//                             ...(createdCriteria.$gte
//                               ? [{ $gte: ['$$lot.createdAt', createdCriteria.$gte] }]
//                               : []),
//                             ...(createdCriteria.$lte
//                               ? [{ $lte: ['$$lot.createdAt', createdCriteria.$lte] }]
//                               : []),
//                           ],
//                         },
//                       ]
//                     : []),
//                 ],
//               },
//             },
//           },
//         },
//       },
//       { $sort: { name: 1 } },
//     ]);
//     res.json(products);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error al obtener productos' });
//   }
// };

export const getExpiringProducts = async (req, res) => {
  const {
    from,
    months,
    branch,
    type,
    createdFrom,
    createdTo,
    overstock, // puede ser "true", "false", "only"
  } = req.query;

  // Obtener y procesar barcodes (separados por coma)
  const barcodes = req.query.barcodes
    ? req.query.barcodes.split(",").map((b) => b.trim())
    : null;

  
  const filtrosActivos = from || months || branch || createdFrom || createdTo;

  const includeOnlyOverstock = overstock === "only";
  const includeOverstock = overstock !== "false";
  const includeRegular = overstock !== "true" && overstock !== "only";

  try {
    // 1. Armar el query de productos
    // 1. Buscar productos (filtrando por tipo si es necesario)
    const productQuery = type ? { type } : {};
     if (barcodes && barcodes.length > 0) {
      productQuery.barcode = { $in: barcodes };
    }
    const products = await Product.find(productQuery).sort({ name: 1 });
    const productIds = products.map((p) => p._id);

    // 2. Armar filtros por separado
    const lotFilters = [];

    if (includeRegular) {
      const filterNoOverstock = {
        overstock: { $ne: true },
        productId: { $in: productIds },
      };

      if (filtrosActivos) {
        const fromDate = dayjs
          .tz(from || dayjs(), "America/Argentina/Buenos_Aires")
          .startOf("month")
          .utc()
          .toDate();

        const untilDate = dayjs(fromDate).add(Number(months), "month").toDate();
        filterNoOverstock.expirationDate = { $gte: fromDate, $lt: untilDate };

        if (branch) filterNoOverstock.branch = branch;

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
        if (Object.keys(createdCriteria).length > 0) {
          filterNoOverstock.createdAt = createdCriteria;
        }
      }

      lotFilters.push(Lot.find(filterNoOverstock));
    }

    if (includeOverstock) {
      const filterOverstock = {
        overstock: true,
        productId: { $in: productIds },
      };
      if (branch) filterOverstock.branch = branch;
      lotFilters.push(Lot.find(filterOverstock));
    }

    // 3. Ejecutar las consultas en paralelo
    // const lotResults = await Promise.all(lotFilters);
    const lotResults = await Promise.all(
      lotFilters.length ? lotFilters : [Promise.resolve([])]
    );

    const allLots = lotResults.flat();

    // 4. Agrupar lotes por productoId
    const lotsGrouped = {};
    for (const lot of allLots) {
      const pid = lot.productId.toString();
      if (!lotsGrouped[pid]) lotsGrouped[pid] = [];
      lotsGrouped[pid].push(lot);
    }

    if (productIds.length === 0) {
      return res.json([]);
    }

    // 5. Armar la respuesta combinada
    const result = products.map((product) => ({
      _id: product._id,
      name: product.name,
      barcode: product.barcode,
      type: product.type,
      lots: (lotsGrouped[product._id.toString()] || []).map((lot) => ({
        _id: lot._id,
        expirationDate: lot.expirationDate,
        quantity: lot.quantity,
        branch: lot.branch,
        createdAt: lot.createdAt,
        overstock: lot.overstock === true,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const searchProductsByName = async (req, res) => {
  const { name } = req.query;
  console.log("NAME", name);
  if (!name) {
    return res.status(400).json({ message: "Falta el nombre en la query" });
  }

  try {
    const regex = new RegExp(name, "i"); // búsqueda insensible a mayúsculas
    const products = await Product.find({
      $or: [{ name: regex }, { barcode: regex }],
    });

    res.json(products);
  } catch (err) {
    console.error("Error buscando por nombre:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// controllers/productController.js
export const deleteLot = async (req, res) => {
  const { productId, lotId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });

    const originalLength = product.lots.length;

    product.lots = product.lots.filter((lot) => lot._id.toString() !== lotId);

    if (product.lots.length === originalLength) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    await product.save();
    res.json({ message: "Lote eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar el lote" });
  }
};

// controllers/productController.js
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) return res.status(404).json({ message: "No encontrado" });

    // Borrar lotes asociados
    await Lot.deleteMany({ product: productId });

    res.json({ message: "Producto y lotes asociados eliminados" });
  } catch (err) {
    console.error("Error borrando producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });

    product.name = name || product.name;
    product.type = type || product.type;

    await product.save();
    res.json({ message: "Producto actualizado", product });
  } catch (err) {
    console.error("Error actualizando producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
