import Product from "../models/Product.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Lot from "../models/Lot.js";
import PriceHistory from "../models/PriceHistory.js";
import ProductList from "../models/ProductList.js";
import mongoose from "mongoose";
import StockImport from "../models/StockImport.js";

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
console.log("HOLAAAA")
  try {
    const product = await Product.findOne({
      $or: [
        { barcode }, // busca en el principal
        { alternateBarcodes: barcode }, // busca en el array de alternativos
      ],
    });

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

export const getExpiringProductsLotesComoString = async (req, res) => {
  const {
    from,
    months,
    branch,
    createdFrom,
    createdTo,
    overstock, // puede ser "true", "false", "only"
    createdBy,
  } = req.query;

  const barcodes = req.query.barcodes
    ? req.query.barcodes.split(",").map((b) => b.trim())
    : null;

  const filtrosActivos = from || months || branch || createdFrom || createdTo;

  const includeOnlyOverstock = overstock === "only";
  const includeOverstock = overstock !== "false";
  const includeRegular = overstock !== "true" && overstock !== "only";

  try {
    const productQuery = {};
    // if (barcodes && barcodes.length > 0) {
    //   productQuery.barcode = { $in: barcodes };
    // }
    if (barcodes && barcodes.length > 0) {
      productQuery.$or = [
        { barcode: { $in: barcodes } },
        { alternateBarcodes: { $in: barcodes } },
      ];
    }

    const products = await Product.find(productQuery).sort({ name: 1 });
    const productIds = products.map((p) => p._id);

    const lotFilters = [];

    // Filtro de fecha de creación
    const createdCriteria = {};
    if (createdFrom) {
      createdCriteria.$gte = dayjs(createdFrom).startOf("day").toDate();
    }
    if (createdTo) {
      createdCriteria.$lte = dayjs(createdTo).endOf("day").toDate();
    }

    // Lotes regulares
    if (includeRegular) {
      const filterNoOverstock = {
        overstock: { $ne: true },
        productId: { $in: productIds },
      };

      if (filtrosActivos) {
        const fromDate = dayjs(from || dayjs())
          .startOf("month")
          .toDate();
        const untilDate = dayjs(fromDate).add(Number(months), "month").toDate();

        filterNoOverstock.expirationDate = { $gte: fromDate, $lt: untilDate };

        if (branch) filterNoOverstock.branch = branch;
        if (createdBy) filterNoOverstock.createdBy = createdBy;
        if (Object.keys(createdCriteria).length > 0) {
          filterNoOverstock.createdAt = createdCriteria;
        }
      }

      lotFilters.push(
        Lot.find(filterNoOverstock)
          .populate("createdBy", "username fullname")
          .populate("branch", "name")
      );
    }

    // Lotes sobrestock
    if (includeOverstock) {
      const filterOverstock = {
        overstock: true,
        productId: { $in: productIds },
      };

      if (branch) filterOverstock.branch = branch;
      if (createdBy) filterOverstock.createdBy = createdBy;
      if (Object.keys(createdCriteria).length > 0) {
        filterOverstock.createdAt = createdCriteria;
      }

      lotFilters.push(
        Lot.find(filterOverstock)
          .populate("createdBy", "username fullname")
          .populate("branch", "name")
      );
    }

    const lotResults = await Promise.all(
      lotFilters.length ? lotFilters : [Promise.resolve([])]
    );

    const allLots = lotResults.flat();

    const lotsGrouped = {};
    for (const lot of allLots) {
      const pid = lot.productId.toString();
      if (!lotsGrouped[pid]) lotsGrouped[pid] = [];
      lotsGrouped[pid].push(lot);
    }

    if (productIds.length === 0) {
      return res.json([]);
    }

    const result = products.map((product) => ({
      _id: product._id,
      name: product.name,
      barcode: product.barcode,
      type: product.type,
      lots: (lotsGrouped[product._id.toString()] || []).map((lot) => ({
        _id: lot._id,
        expirationDate: lot.expirationDate,
        quantity: lot.quantity,
        branch:
          typeof lot.branch === "object"
            ? lot.branch.name
            : typeof lot.branch === "string"
            ? lot.branch
            : null,
        createdAt: lot.createdAt,
        overstock: lot.overstock === true,
        createdBy: lot.createdBy
          ? {
              _id: lot.createdBy._id,
              username: lot.createdBy.username,
              fullname: lot.createdBy.fullname,
            }
          : null,
      })),
    }));
    console.log("RESULTADO", result);
    res.json(result);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// export const getExpiringProducts = async (req, res) => {
//   const {
//     from,
//     months,
//     branch,
//     createdFrom,
//     createdTo,
//     overstock, // puede ser "true", "false", "only"
//     createdBy,
//   } = req.query;

//   const barcodes = req.query.barcodes
//     ? req.query.barcodes.split(",").map((b) => b.trim())
//     : null;

//   const filtrosActivos = from || months || branch || createdFrom || createdTo;

//   const includeOnlyOverstock = overstock === "only";
//   const includeOverstock = overstock !== "false";
//   const includeRegular = overstock !== "true" && overstock !== "only";

//   try {
//     const productQuery = {};
//     if (barcodes && barcodes.length > 0) {
//       productQuery.barcode = { $in: barcodes };
//     }

//     const products = await Product.find(productQuery).sort({ name: 1 });
//     const productIds = products.map((p) => p._id);

//     const lotFilters = [];

//     // Filtro de fecha de creación
//     const createdCriteria = {};
//     if (createdFrom) {
//       createdCriteria.$gte = dayjs(createdFrom).startOf("day").toDate();
//     }
//     if (createdTo) {
//       createdCriteria.$lte = dayjs(createdTo).endOf("day").toDate();
//     }

//     // Lotes regulares
//     if (includeRegular) {
//       const filterNoOverstock = {
//         overstock: { $ne: true },
//         productId: { $in: productIds },
//       };

//       if (filtrosActivos) {
//         const fromDate = dayjs(from || dayjs()).startOf("month").toDate();
//         const untilDate = dayjs(fromDate).add(Number(months), "month").toDate();

//         filterNoOverstock.expirationDate = { $gte: fromDate, $lt: untilDate };

//         if (branch) filterNoOverstock.branch = branch;
//         if (createdBy) filterNoOverstock.createdBy = createdBy;
//         if (Object.keys(createdCriteria).length > 0) {
//           filterNoOverstock.createdAt = createdCriteria;
//         }
//       }

//       lotFilters.push(
//         Lot.find(filterNoOverstock)
//           .populate("createdBy", "username fullname")
//           .populate("branch", "name")
//       );
//     }

//     // Lotes sobrestock
//     if (includeOverstock) {
//       const filterOverstock = {
//         overstock: true,
//         productId: { $in: productIds },
//       };

//       if (branch) filterOverstock.branch = branch;
//       if (createdBy) filterOverstock.createdBy = createdBy;
//       if (Object.keys(createdCriteria).length > 0) {
//         filterOverstock.createdAt = createdCriteria;
//       }

//       lotFilters.push(
//         Lot.find(filterOverstock)
//           .populate("createdBy", "username fullname")
//           .populate("branch", "name")
//       );
//     }

//     const lotResults = await Promise.all(
//       lotFilters.length ? lotFilters : [Promise.resolve([])]
//     );

//     const allLots = lotResults.flat();

//     const lotsGrouped = {};
//     for (const lot of allLots) {
//       const pid = lot.productId.toString();
//       if (!lotsGrouped[pid]) lotsGrouped[pid] = [];
//       lotsGrouped[pid].push(lot);
//     }

//     if (productIds.length === 0) {
//       return res.json([]);
//     }

//     const result = products.map((product) => ({
//       _id: product._id,
//       name: product.name,
//       barcode: product.barcode,
//       type: product.type,
//       lots: (lotsGrouped[product._id.toString()] || []).map((lot) => ({
//         _id: lot._id,
//         expirationDate: lot.expirationDate,
//         quantity: lot.quantity,
//         branch:
//           typeof lot.branch === "object"
//             ? lot.branch.name
//             : typeof lot.branch === "string"
//             ? lot.branch
//             : null,
//         createdAt: lot.createdAt,
//         overstock: lot.overstock === true,
//         createdBy: lot.createdBy
//           ? {
//               _id: lot.createdBy._id,
//               username: lot.createdBy.username,
//               fullname: lot.createdBy.fullname,
//             }
//           : null,
//       })),
//     }));
// console.log("RESULTADO", result)
//     res.json(result);
//   } catch (err) {
//     console.error("Error al obtener productos:", err);
//     res.status(500).json({ message: "Error al obtener productos" });
//   }
// };

export const getExpiringProducts = async (req, res) => {
  const {
    from,
    months = 6,
    branch,
    createdFrom,
    createdTo,
    overstock, // "true", "false", "only"
    createdBy,
    barcodes,
  } = req.query;

  try {
    const fromDate = dayjs(from || dayjs())
      .startOf("month")
      .toDate();
    const untilDate = dayjs(fromDate).add(Number(months), "month").toDate();

    const createdCriteria = {};
    if (createdFrom) {
      createdCriteria.$gte = dayjs(createdFrom).startOf("day").toDate();
    }
    if (createdTo) {
      createdCriteria.$lte = dayjs(createdTo).endOf("day").toDate();
    }

    // Construir filtros base
    const filter = {
      expirationDate: { $gte: fromDate, $lt: untilDate },
    };

    let branchId = null;
    console.log("ACA", branch);
    // if (branch) filter.branch = branch;
    if (branch) {
      if (Array.isArray(branch)) {
        filter.branch = {
          $in: branch.map((id) => new mongoose.Types.ObjectId(id)),
        };
      } else if (typeof branch === "string" && branch.includes(",")) {
        // caso string con IDs separados por coma
        filter.branch = {
          $in: branch
            .split(",")
            .map((id) => new mongoose.Types.ObjectId(id.trim())),
        };
      } else {
        filter.branch = new mongoose.Types.ObjectId(branch);
      }
    }

    if (createdBy) filter.createdBy = createdBy;
    if (Object.keys(createdCriteria).length) {
      filter.createdAt = createdCriteria;
    }

    // Filtro overstock
    if (overstock === "true") {
      filter.overstock = true;
    } else if (overstock === "false") {
      filter.overstock = { $ne: true };
    } // si es "only", ya está cubierto con "true"

    if (barcodes) {
      const barcodeList = barcodes.split(",").map((b) => b.trim());
      const products = await Product.find({
        $or: [
          { barcode: { $in: barcodeList } },
          { alternateBarcodes: { $in: barcodeList } },
        ],
      }).select("_id");

      const ids = products.map((p) => p._id);
      filter.productId = { $in: ids };
    }

    const lots = await Lot.find(filter)
      .populate("productId", "name barcode type")
      .populate("createdBy", "username fullname")
      .populate("branch", "name")
      .lean();

    // Agrupar por producto
    const grouped = {};
    for (const lot of lots) {
      const product = lot.productId;
      if (!product || !product._id) continue;

      const pid = product._id.toString();

      if (!grouped[pid]) {
        grouped[pid] = {
          _id: product._id,
          name: product.name,
          barcode: product.barcode,
          type: product.type,
          lots: [],
        };
      }

      grouped[pid].lots.push({
        _id: lot._id,
        expirationDate: lot.expirationDate,
        quantity: lot.quantity,
        branch: typeof lot.branch === "object" ? lot.branch.name : lot.branch,
        createdAt: lot.createdAt,
        overstock: lot.overstock === true,
        createdBy: lot.createdBy || null,
        batchNumber: lot.batchNumber || null,
        serialNumber: lot.serialNumber || null,
      });
    }

    const result = Object.values(grouped);
    res.json(result);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const searchProductsByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Falta el nombre en la query" });
  }

  try {
    const regex = new RegExp(name, "i"); // búsqueda insensible a mayúsculas
    const products = await Product.find({
      $or: [
        { name: regex },
        { barcode: regex },
        { alternateBarcodes: regex }, // ← esto agrega la búsqueda en alternativos
      ],
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

// Podés usar este en un endpoint tipo POST + archivo

// export const importProducts = async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: "No se envió ningún archivo." });
//     }

//     const workbook = xlsx.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     let count = 0;

//     for (const row of data) {
//       const barcode = String(row.Codebar).trim();
//       const name = row.Producto?.toString().trim();

//       if (!barcode || !name) continue;

//       // Si no existe ya, lo creo
//       const exists = await Product.findOne({ barcode });
//       if (!exists) {
//         await Product.create({ barcode, name });
//         count++;
//       }
//     }

//     res.json({ message: `Se importaron ${count} productos.` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error al procesar el archivo." });
//   }
// };

// controllers/productController.js
// export const importProducts = async (req, res) => {
//   const products = req.body;

//   if (!Array.isArray(products) || products.length === 0) {
//     return res.status(400).json({ message: "No se enviaron productos." });
//   }

//   try {
//     const inserted = await Product.insertMany(products, { ordered: false });
//     res
//       .status(201)
//       .json({ message: `Se importaron ${inserted.length} productos.` });
//   } catch (err) {
//     console.error("Error al importar productos:", err);
//     return res.status(500).json({ message: "Error al importar productos." });
//   }
// };

export const importProducts = async (req, res) => {
  console.log("EN REALIDAD USO ESTE CONTROLADOR");
  const products = req.body;
  console.log("products", products);
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "No se enviaron productos." });
  }

  const inserted = [];
  const alreadyExists = [];

  // función para dividir en grupos de tamaño 20
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const chunks = chunkArray(products, 20);

  try {
    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(async (prod) => {
          const exists = await Product.findOne({ barcode: prod.barcode });
          if (!exists) {
            const created = await Product.create(prod);
            inserted.push(created);
          } else {
            alreadyExists.push(prod.barcode);
          }
        })
      );

      // opcional: podés loguear errores individuales si querés
      results
        .filter((r) => r.status === "rejected")
        .forEach((r) => console.error("❌ Error:", r.reason));
    }

    res.status(201).json({
      message: `✅ Se importaron ${inserted.length} productos.`,
      alreadyExistsCount: alreadyExists.length,
      alreadyExists,
    });
  } catch (err) {
    console.error("Error general al importar productos:", err);
    return res.status(500).json({ message: "Error al importar productos." });
  }
};
export const updateProductPrices = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Product list is empty or invalid" });
    }

    const updates = [];

    for (const item of products) {
      const { barcode, price } = item;
      if (!barcode || typeof price !== "number") continue;

      const product = await Product.findOne({ barcode });
      if (!product) continue;

      // ⚠️ Comprobación: solo si el precio cambió
      if (product.currentPrice !== price) {
        product.currentPrice = price;
        await product.save();

        await PriceHistory.create({
          productId: product._id,
          price,
        });

        updates.push({ barcode, price });
      }
    }

    return res.json({ message: "Prices updated", updates });
  } catch (error) {
    console.error("Error updating prices:", error);
    res.status(500).json({ message: "Server error updating prices" });
  }
};

export const updatePricesFromList = async (req, res) => {
  try {
    const { listId, products } = req.body;

    if (!listId) return res.status(400).json({ message: "List ID required" });
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Products list is empty or invalid" });
    }

    // 1. Obtener la lista y los productos que tiene (solo los barcodes)
    const list = await ProductList.findById(listId).populate(
      "products",
      "barcode"
    );
    if (!list) return res.status(404).json({ message: "List not found" });

    const barcodesInList = new Set(list.products.map((p) => p.barcode));

    // 2. Filtrar productos recibidos para que estén en la lista
    const filteredProducts = products.filter((p) =>
      barcodesInList.has(p.barcode)
    );

    // 3. Actualizar sólo esos productos
    const updates = [];

    for (const item of filteredProducts) {
      const { barcode, price } = item;
      if (!barcode || typeof price !== "number") continue;

      const product = await Product.findOne({ barcode });
      if (!product) continue;

      if (product.currentPrice !== price) {
        product.currentPrice = price;
        await product.save();

        await PriceHistory.create({
          productId: product._id,
          price,
        });

        // ✅ ACTUALIZAR lastTagDate para este producto dentro de la lista
        const productInList = list.products.find(
          (p) => p.product?.toString?.() === product._id.toString()
        );
        if (productInList) {
          productInList.lastTagDate = new Date();
        }

        updates.push({ barcode, price });
      }
    }

    // ✅ Guardar cambios en la lista (para que se actualice lastTagDate)
    await list.save();

    return res.json({ message: "Prices updated for list products", updates });
  } catch (error) {
    console.error("Error updating prices:", error);
    res.status(500).json({ message: "Server error updating prices" });
  }
};

export const getPriceHistory = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ barcode });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      barcode: product.barcode,
      name: product.name,
      currentPrice: product.currentPrice,
      priceHistory: product.priceHistory,
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsWithoutPrice = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [{ currentPrice: { $exists: false } }, { currentPrice: 0 }],
    })
      .select("barcode name currentPrice")
      .sort({ name: 1 }) // opcional: orden alfabético
      .limit(100); // 👈 solo los primeros 100

    res.json(products);
  } catch (error) {
    console.error("Error buscando productos sin precio:", error);
    res.status(500).json({ message: "Error al obtener productos sin precio" });
  }
};


// export const getProductsByCodebarsWithImport = async (req, res) => {
//   try {
//     const { importId, codebars } = req.body;
// console.log("importId, codebars",importId, codebars)
//     if (!importId || !Array.isArray(codebars) || codebars.length === 0) {
//       return res.status(400).json({
//         message: "Faltan datos: importId y codebars",
//       });
//     }

//     const stockImport = await StockImport.findById(importId).lean();
//     if (!stockImport) {
//       return res.status(404).json({ message: "Importación no encontrada" });
//     }

//     const cleanCodes = [...new Set(codebars.map((c) => String(c).trim()))];

//     // 1) Buscar productos por barcode o alternateBarcodes
//     const products = await Product.find({
//       $or: [
//         { barcode: { $in: cleanCodes } },
//         { alternateBarcodes: { $in: cleanCodes } },
//       ],
//     }).lean();

//     // 2) Armar productsMap: cualquier código -> product
//     const productsMap = new Map();

//     for (const p of products) {
//       if (p.barcode) productsMap.set(String(p.barcode).trim(), p);

//       if (Array.isArray(p.alternateBarcodes)) {
//         for (const alt of p.alternateBarcodes) {
//           if (alt) productsMap.set(String(alt).trim(), p);
//         }
//       }
//     }

//     // 3) Armar importRowsMap: barcode -> row
//     // Si hay repetidos, elegimos el "mejor" (ej: stock mayor)
//     const importRowsMap = new Map();

//     for (const row of stockImport.rows || []) {
//       const b = row.barcode?.toString().trim();
//       if (!b) continue;

//       if (!cleanCodes.includes(b)) continue;

//       const prev = importRowsMap.get(b);

//       if (!prev) {
//         importRowsMap.set(b, row);
//       } else {
//         // elegimos mejor row (por stock > 0)
//         const prevStock = typeof prev.stock === "number" ? prev.stock : 0;
//         const rowStock = typeof row.stock === "number" ? row.stock : 0;

//         if (rowStock > prevStock) {
//           importRowsMap.set(b, row);
//         }
//       }
//     }

//     // 4) Armar respuesta
//     const found = [];
//     const notFound = [];

//     for (const code of cleanCodes) {
//       const product = productsMap.get(code);

//       if (!product) {
//         notFound.push(code);
//         continue;
//       }

//       // buscamos si hay row en import para ese código
//       const importRow = importRowsMap.get(code) || null;

//       // detectar si matcheó por barcode o alternateBarcodes
//       const matchedBy =
//         product.barcode && String(product.barcode).trim() === code
//           ? "barcode"
//           : "alternateBarcodes";

//       found.push({
//         codeSearched: code,
//         matchedBy,
//         product,
//         importRow,
//       });
//     }

//     return res.json({
//       message: "OK",
//       found,
//       notFound,
//     });
//   } catch (error) {
//     console.error("❌ Error en getProductsByCodebarsWithImport:", error);
//     return res.status(500).json({ message: "Error del servidor" });
//   }
// };

export const getProductsByCodebarsWithImport = async (req, res) => {
  try {
    const { importId, codebars } = req.body;

    console.log("importId, codebars", importId, codebars);

    if (!importId || !Array.isArray(codebars) || codebars.length === 0) {
      return res.status(400).json({
        message: "Faltan datos: importId y codebars",
      });
    }

    const stockImport = await StockImport.findById(importId).lean();
    if (!stockImport) {
      return res.status(404).json({ message: "Importación no encontrada" });
    }

    const cleanCodes = [...new Set(codebars.map((c) => String(c).trim()))];

    // 1) Buscar productos por barcode o alternateBarcodes
    const products = await Product.find({
      $or: [
        { barcode: { $in: cleanCodes } },
        { alternateBarcodes: { $in: cleanCodes } },
      ],
    }).lean();

    // 2) Armar productsMap: cualquier código -> product
    const productsMap = new Map();

    for (const p of products) {
      if (p.barcode) productsMap.set(String(p.barcode).trim(), p);

      if (Array.isArray(p.alternateBarcodes)) {
        for (const alt of p.alternateBarcodes) {
          if (alt) productsMap.set(String(alt).trim(), p);
        }
      }
    }

    // 3) Armar importRowsMap: barcode -> row (SIN filtrar por cleanCodes)
    // ⚠️ IMPORTANTE: NO filtramos por cleanCodes porque:
    // cleanCodes puede contener IDProducto, pero el import tiene EAN real.
    const importRowsMap = new Map();

    for (const row of stockImport.rows || []) {
      const b = row.barcode?.toString().trim();
      if (!b) continue;

      const prev = importRowsMap.get(b);

      if (!prev) {
        importRowsMap.set(b, row);
      } else {
        // elegimos mejor row (por stock > 0)
        const prevStock = typeof prev.stock === "number" ? prev.stock : 0;
        const rowStock = typeof row.stock === "number" ? row.stock : 0;

        if (rowStock > prevStock) {
          importRowsMap.set(b, row);
        }
      }
    }

    // helper: buscar importRow por cualquier código del producto
    const findBestImportRow = (codeSearched, product) => {
      const codesToTry = [
        codeSearched,
        product?.barcode,
        ...(Array.isArray(product?.alternateBarcodes)
          ? product.alternateBarcodes
          : []),
      ]
        .filter(Boolean)
        .map((x) => String(x).trim());

      for (const c of codesToTry) {
        const row = importRowsMap.get(c);
        if (row) return row;
      }

      return null;
      
    };

    // 4) Armar respuesta
    const found = [];
    const notFound = [];

    for (const code of cleanCodes) {
      const product = productsMap.get(code);

      if (!product) {
        notFound.push(code);
        continue;
      }

      // ✅ buscamos el importRow por barcode O alternateBarcodes
      const importRow = findBestImportRow(code, product);

      const matchedBy =
        product.barcode && String(product.barcode).trim() === code
          ? "barcode"
          : "alternateBarcodes";

      found.push({
        codeSearched: code,
        matchedBy,
        product,
        importRow,
      });
    }

    return res.json({
      message: "OK",
      found,
      notFound,
    });
  } catch (error) {
    console.error("❌ Error en getProductsByCodebarsWithImport:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};
