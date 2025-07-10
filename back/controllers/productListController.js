// controllers/productListController.js
import ProductList from "../models/ProductList.js";
import Product from "../models/Product.js";
import XLSX from "xlsx";
import PriceHistory from "../models/PriceHistory.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import mongoose from "mongoose";
import PriceUploadLog from "../models/PriceUploadLog.js";
import Stock from "../models/Stock.js";
dayjs.extend(utc);
dayjs.extend(timezone);

export const createProductList = async (req, res) => {
  try {
    const list = new ProductList(req.body);
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductListsByBranch = async (req, res) => {
  try {
    const lists = await ProductList.find({
      branch: req.params.branchId,
    }).populate("products.product");
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeProductFromList = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    list.products = list.products.filter(
      (entry) => entry.product.toString() !== req.params.productId
    );

    await list.save();

    res.json(list);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductList = async (req, res) => {
  try {
    const result = await ProductList.findByIdAndDelete(req.params.listId);
    if (!result)
      return res.status(404).json({ message: "Lista no encontrada" });
    res.json({ message: "Lista eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/listController.js
// export const addProductToList = async (req, res) => {
//   const { listId, productId } = req.params; // lista
//   // const { productId } = req.body;
//   console.log("listId", listId);

//   const list = await ProductList.findById(listId);
//   if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//   if (!list.products.includes(productId)) {
//     list.products.push(productId);
//     await list.save();
//   }

//   res.json(list);
// };

export const addProductToList = async (req, res) => {
  const { listId, productId } = req.params;

  const list = await ProductList.findById(listId);
  if (!list) return res.status(404).json({ message: "Lista no encontrada" });

  // Verificar si el producto ya está en la lista
  const alreadyExists = list.products.some(
    (entry) => entry.product.toString() === productId
  );

  if (!alreadyExists) {
    list.products.push({ product: productId, lastTagDate: null }); // o new Date(0)
    await list.save();
  }

  res.json(list);
};

// export const getProductListById = async (req, res) => {
//   try {
//     const list = await ProductList.findById(req.params.id)
//       .populate({
//         path: "products.product",
//       })
//       .populate("branch");

//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     res.json(list);
//   } catch (err) {
//     console.error("Error al obtener la lista por ID:", err);
//     res.status(500).json({ message: "Error al obtener la lista" });
//   }
// };

// controllers/productListController.js

export const getProductListById = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.id)
      .populate("branch")
      .populate({
        path: "products.product",
        populate: {
          path: "priceHistory",
          options: { sort: { date: -1 } }, // opcional, para traerlo ordenado por fecha descendente
        },
      });

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });
    console.log("LISTA", list[0]);
    const branchId = list.branch._id;
    const productIds = list.products.map((p) => p.product?._id).filter(Boolean);

    const stocks = await Stock.find({
      product: { $in: productIds },
      branch: branchId,
    });
    console.log("stocks", stocks);

    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[s.product.toString()] = s.quantity;
    });

    // Asignar stock al producto
    list.products = list.products.map((p) => {
      const prod = p.product?.toObject(); // convertir a objeto plano
      if (prod) {
        prod.stock = stockMap[prod._id.toString()] ?? 0;
        return { ...p.toObject(), product: prod };
      }
      return p;
    });

    res.json(list);
  } catch (err) {
    console.error("Error al obtener la lista por ID:", err);
    res.status(500).json({ message: "Error al obtener la lista" });
  }
};

export const addQuickProducts = async (req, res) => {
  const { listId } = req.params;
  const { items } = req.body; // [{ barcode, name }]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });

    const existingBarcodes = new Set(list.quickProducts.map((p) => p.barcode));
    const newItems = items.filter(
      (item) => !existingBarcodes.has(item.barcode)
    );

    list.quickProducts.push(...newItems);
    await list.save();

    res.json(list.quickProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar códigos rápidos" });
  }
};

export const getQuickProducts = async (req, res) => {
  const { listId } = req.params;
  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });
    res.json(list.quickProducts || []);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos rápidos" });
  }
};

// controllers/productListController.js

export const updateQuickProducts = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // [{ barcode, name? }]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items debe ser un array" });
  }

  try {
    const list = await ProductList.findById(id);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });

    // Validar cada item
    const validItems = items
      .filter((item) => item.barcode && typeof item.barcode === "string")
      .map((item) => ({
        barcode: item.barcode.trim(),
        name: item.name?.trim() || "",
      }));

    list.quickProducts = validItems;
    await list.save();

    res.json(list.quickProducts);
  } catch (err) {
    console.error("Error al actualizar quickProducts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const clearQuickProducts = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    list.quickProducts = [];
    await list.save();

    res.json({ message: "Productos rápidos eliminados" });
  } catch (err) {
    console.error("Error al eliminar productos rápidos", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// export const comparePricesByDate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res
//         .status(400)
//         .json({ message: "Parámetros 'from' y 'to' son requeridos" });
//     }

//     const fromStart = dayjs
//       .tz(from, "America/Argentina/Buenos_Aires")
//       .startOf("day")
//       .utc()
//       .toDate();
//     const toEnd = dayjs
//       .tz(to, "America/Argentina/Buenos_Aires")
//       .endOf("day")
//       .utc()
//       .toDate();

//     const list = await ProductList.findById(id).populate({
//       path: "products",
//       populate: {
//         path: "priceHistory",
//         model: "PriceHistory",
//       },
//     });

//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const result = [];

//     for (const product of list.products) {
//       const history = product.priceHistory || [];

//       const beforeFrom = history.filter((h) => h.date < fromStart);
//       const inRange = history.filter(
//         (h) => h.date >= fromStart && h.date <= toEnd
//       );

//       if (inRange.length === 0) continue;

//       const sorted = inRange.sort((a, b) => a.date - b.date);
//       const first = sorted[0];
//       const last = sorted[sorted.length - 1];

//       const isFirstPriceEver = beforeFrom.length === 0;
//       console.log("isFirstPriceEver", isFirstPriceEver);
//       result.push({
//         _id: product._id,
//         barcode: product.barcode,
//         name: product.name,
//         fromPrice: first.price,
//         toPrice: last.price,
//         changed: first.price !== last.price,
//         firstPrice: isFirstPriceEver, // 🟢 clave para el frontend
//       });
//     }

//     res.json({ listName: list.name, products: result });
//   } catch (error) {
//     console.error("Error comparando precios:", error);
//     res.status(500).json({ message: "Error del servidor" });
//   }
// };

// export const comparePricesByDate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res.status(400).json({ message: "Parámetros 'from' y 'to' son requeridos" });
//     }

//     // Convertimos fechas a zona de Argentina y luego a UTC para consulta correcta en Mongo
//     const fromStart = dayjs.tz(from, "America/Argentina/Buenos_Aires").startOf("day").utc().toDate();
//     const toEnd = dayjs.tz(to, "America/Argentina/Buenos_Aires").endOf("day").utc().toDate();

//     const list = await ProductList.findById(id).populate({
//       path: "products",
//       populate: {
//         path: "priceHistory",
//         model: "PriceHistory"
//       }
//     });

//     if (!list) {
//       return res.status(404).json({ message: "Lista no encontrada" });
//     }

//     const result = [];

//     for (const product of list.products) {
//       const history = product.priceHistory || [];

//       // Filtramos sólo las entradas de precio dentro del rango de fechas
//       const filteredHistory = history.filter(
//         (h) => h.date >= fromStart && h.date <= toEnd
//       );

//       if (filteredHistory.length === 0) continue; // no hay datos para este producto en rango

//       // Ordenamos por fecha ascendente para comparar correctamente
//       const sorted = filteredHistory.sort((a, b) => a.date - b.date);

//       if (sorted.length === 1) {
//         // Sólo un precio en el rango = primer precio detectado
//         const only = sorted[0];
//         result.push({
//           _id: product._id,
//           barcode: product.barcode,
//           name: product.name,
//           toPrice: only.price,
//           firstPrice: true,
//           changed: false,
//         });
//       } else {
//         // Dos o más precios: comparamos primero y último
//         const first = sorted[0];
//         const last = sorted[sorted.length - 1];
//         result.push({
//           _id: product._id,
//           barcode: product.barcode,
//           name: product.name,
//           fromPrice: first.price,
//           toPrice: last.price,
//           changed: first.price !== last.price,
//         });
//       }
//     }

//     return res.json({ listName: list.name, products: result });
//   } catch (error) {
//     console.error("Error comparando precios:", error);
//     return res.status(500).json({ message: "Error del servidor" });
//   }
// };

//  export const uploadPricesForList = async (req, res) => {
//   try {
//     const { listId } = req.params;
//     const { products } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: "Lista de productos vacía o inválida" });
//     }

//     const list = await ProductList.findById(listId).populate(
//       "products",
//       "barcode _id name currentPrice"
//     );
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const listBarcodesSet = new Set(list.products.map((p) => p.barcode));
//     const incomingBarcodesSet = new Set(products.map((p) => p.barcode));

//     const priceIncreased = [];
//     const priceDecreased = [];
//     const priceUnchanged = [];
//     const firstTimeSet = [];
//     const notInList = [];

//     const nowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     for (const { barcode, price } of products) {
//       if (!barcode || typeof price !== "number") continue;

//       if (!listBarcodesSet.has(barcode)) {
//         notInList.push({ barcode, price });
//         continue;
//       }

//       const product = list.products.find((p) => p.barcode === barcode);
//       const hadNoPrice =
//         product.currentPrice === undefined ||
//         product.currentPrice === null ||
//         product.currentPrice === 0;

//       const oldPrice = product.currentPrice ?? 0;

//       if (hadNoPrice) {
//         // Actualizamos precio y creamos historial si nunca tuvo precio
//         await Product.findByIdAndUpdate(product._id, { currentPrice: price });

//         const history = await PriceHistory.create({
//           productId: product._id,
//           price,
//           date: nowArgentina,
//         });

//         await Product.findByIdAndUpdate(product._id, {
//           $push: { priceHistory: history._id },
//         });

//         firstTimeSet.push({
//           barcode,
//           name: product.name,
//           newPrice: price,
//         });
//       } else if (price === oldPrice) {
//         // Precio sin cambios: no hacemos nada
//         priceUnchanged.push({
//           barcode,
//           name: product.name,
//           price,
//         });
//       } else {
//         // Precio cambió: actualizamos y guardamos historial
//         await Product.findByIdAndUpdate(product._id, { currentPrice: price });

//         const history = await PriceHistory.create({
//           productId: product._id,
//           price,
//           date: nowArgentina,
//         });

//         await Product.findByIdAndUpdate(product._id, {
//           $push: { priceHistory: history._id },
//         });

//         const priceChange = {
//           barcode,
//           name: product.name,
//           oldPrice,
//           newPrice: price,
//         };

//         if (price > oldPrice) {
//           priceIncreased.push(priceChange);
//         } else {
//           priceDecreased.push(priceChange);
//         }
//       }
//     }

//     const missingInExcel = list.products
//       .filter((p) => !incomingBarcodesSet.has(p.barcode))
//       .map((p) => ({
//         barcode: p.barcode,
//         name: p.name,
//         currentPrice: p.currentPrice || 0,
//       }));

//     res.json({
//       message: `Actualización de precios para la lista "${list.name}"`,
//       priceIncreased,
//       priceDecreased,
//       priceUnchanged,
//       firstTimeSet,
//       missingInExcel,
//       notInList,
//     });
//   } catch (error) {
//     console.error("Error al subir precios:", error);
//     res.status(500).json({ message: "Error del servidor actualizando precios" });
//   }
// };

// export const comparePricesByDate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { from, to } = req.query;
//     console.log("from, to", from, to);

//     if (!from || !to) {
//       return res
//         .status(400)
//         .json({ message: "Parámetros 'from' y 'to' son requeridos" });
//     }

//     const fromDate = new Date(from);
//     const toDate = new Date(to);

//     const list = await ProductList.findById(id).populate("products");

//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const result = [];

//     for (const product of list.products) {
//       const history = product.priceHistory || [];

//       const fromPrices = history.filter(
//         (h) => new Date(h.date) >= fromDate && new Date(h.date) < toDate
//       );
//       const toPrices = history.filter((h) => new Date(h.date) >= toDate);

//       const oldestFrom = fromPrices[0];
//       const newestTo = toPrices[toPrices.length - 1];

//       if (oldestFrom && newestTo) {
//         const changed = oldestFrom.price !== newestTo.price;

//         result.push({
//           _id: product._id,
//           barcode: product.barcode,
//           name: product.name,
//           fromPrice: oldestFrom.price,
//           toPrice: newestTo.price,
//           changed,
//         });
//       }
//     }
//     console.log("result", result);
//     res.json({ listName: list.name, products: result });
//   } catch (error) {
//     console.error("Error comparando precios:", error);
//     res.status(500).json({ message: "Error del servidor" });
//   }
// };

// export const uploadPricesForList = async (req, res) => {
//   try {
//     const { listId } = req.params;
//     const { products } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Lista de productos vacía o inválida" });
//     }

//     const list = await ProductList.findById(listId).populate(
//       "products",
//       "barcode _id name currentPrice"
//     );
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const listBarcodesSet = new Set(list.products.map((p) => p.barcode));
//     const incomingBarcodesSet = new Set(products.map((p) => p.barcode));

//     const priceIncreased = [];
//     const priceDecreased = [];
//     const priceUnchanged = [];
//     const notInList = [];

//     for (const { barcode, price } of products) {
//       if (!barcode || typeof price !== "number") continue;

//       if (!listBarcodesSet.has(barcode)) {
//         notInList.push({ barcode, price });
//         continue;
//       }

//       const product = list.products.find((p) => p.barcode === barcode);
//       const oldPrice = product.currentPrice || 0;

//       if (price === oldPrice) {
//         priceUnchanged.push({ barcode, name: product.name, price });
//       } else if (price > oldPrice) {
//         priceIncreased.push({
//           barcode,
//           name: product.name,
//           oldPrice,
//           newPrice: price,
//         });
//       } else {
//         priceDecreased.push({
//           barcode,
//           name: product.name,
//           oldPrice,
//           newPrice: price,
//         });
//       }

//       // Actualizar
//       await Product.findByIdAndUpdate(product._id, { currentPrice: price });
//       await PriceHistory.create({ productId: product._id, price });
//     }

//     const missingInExcel = list.products
//       .filter((p) => !incomingBarcodesSet.has(p.barcode))
//       .map((p) => ({
//         barcode: p.barcode,
//         name: p.name,
//         currentPrice: p.currentPrice || 0,
//       }));

//     res.json({
//       message: `Actualización de precios para la lista "${list.name}"`,
//       priceIncreased,
//       priceDecreased,
//       priceUnchanged,
//       missingInExcel,
//       notInList,
//     });
//   } catch (error) {
//     console.error("Error al subir precios:", error);
//     res
//       .status(500)
//       .json({ message: "Error del servidor actualizando precios" });
//   }
// };

// export const uploadPricesForList = async (req, res) => {
//   try {
//     const { listId } = req.params;
//     const { products } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: "Lista de productos vacía o inválida" });
//     }

//     const list = await ProductList.findById(listId).populate("products", "barcode _id name currentPrice");
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const barcodesSet = new Set(list.products.map((p) => p.barcode));
//     const incomingBarcodes = new Set(products.map((p) => p.barcode));

//     const updated = [];
//     const unchanged = [];
//     const changed = [];

//     for (const item of products) {
//       const { barcode, price } = item;
//       if (!barcode || typeof price !== "number") continue;
//       if (!barcodesSet.has(barcode)) continue;

//       const product = list.products.find((p) => p.barcode === barcode);
//       if (!product) continue;

//       const oldPrice = product.currentPrice || 0;

//       if (price === oldPrice) {
//         unchanged.push({ barcode, name: product.name, price });
//       } else {
//         changed.push({ barcode, name: product.name, oldPrice, newPrice: price });

//         // Update DB
//         await Product.findByIdAndUpdate(product._id, { currentPrice: price });
//         await PriceHistory.create({ productId: product._id, price });
//         updated.push({ barcode, name: product.name, price });
//       }
//     }

//     // Productos que están en la lista pero no vinieron en el Excel
//     const missingInExcel = list.products
//       .filter((p) => !incomingBarcodes.has(p.barcode))
//       .map((p) => ({
//         barcode: p.barcode,
//         name: p.name,
//         currentPrice: p.currentPrice || 0,
//       }));

//     res.json({
//       message: `Precios actualizados para la lista ${list.name}`,
//       updated,
//       unchanged,
//       changed,
//       missingInExcel,
//     });
//   } catch (error) {
//     console.error("Error updating prices for list:", error);
//     res.status(500).json({ message: "Error del servidor actualizando precios" });
//   }
// };

// export const uploadPricesForList = async (req, res) => {

//   try {
//     const { listId } = req.params;
//     const { products } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: "Product list is empty or invalid" });
//     }

//     // Buscamos la lista y sus productos (asegurate que 'name' esté en el populate)
//     const list = await ProductList.findById(listId).populate("products", "barcode _id name");
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     // Creamos un Set para barcodes de la lista
//     const barcodesSet = new Set(list.products.map(p => p.barcode));

//     const updated = [];
//     const notUpdated = [];

//     for (const item of products) {
//       const { barcode, price } = item;
//       if (!barcode || typeof price !== "number") continue;

//       // Buscamos producto en la lista
//       const productInList = list.products.find(p => p.barcode === barcode);
//       if (productInList) {
//         // Actualizar precio actual
//         await Product.findByIdAndUpdate(productInList._id, { currentPrice: price });

//         // Guardar historial de precios
//         await PriceHistory.create({
//           productId: productInList._id,
//           price,
//         });

//         updated.push({
//           barcode,
//           price,
//           name: productInList.name,
//         });
//       } else {
//         notUpdated.push({ barcode, price });
//       }
//     }

//     return res.json({
//       message: `Precios actualizados para la lista ${list.name}`,
//       updated,
//       notUpdated,
//     });
//   } catch (error) {
//     console.error("Error updating prices for list:", error);
//     return res.status(500).json({ message: "Error del servidor actualizando precios" });
//   }
// };

// export const uploadPricesForList = async (req, res) => {
//   try {
//     const { listId } = req.params;
//     const { products } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Lista de productos vacía o inválida" });
//     }

//     const list = await ProductList.findById(listId).populate(
//       "products",
//       "barcode _id name currentPrice"
//     );
//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     const listBarcodesSet = new Set(list.products.map((p) => p.barcode));
//     const incomingBarcodesSet = new Set(products.map((p) => p.barcode));

//     const priceIncreased = [];
//     const priceDecreased = [];
//     const priceUnchanged = [];
//     const notInList = [];

//     for (const { barcode, price } of products) {
//       if (!barcode || typeof price !== "number") continue;

//       if (!listBarcodesSet.has(barcode)) {
//         notInList.push({ barcode, price });
//         continue;
//       }

//       const product = list.products.find((p) => p.barcode === barcode);
//       const oldPrice = product.currentPrice || 0;

//       if (price === oldPrice) {
//         priceUnchanged.push({ barcode, name: product.name, price });
//         continue; // No actualizamos ni guardamos historial
//       }

//       // Actualizar si cambió
//       await Product.findByIdAndUpdate(product._id, { currentPrice: price });
//       await PriceHistory.create({ productId: product._id, price });

//       if (price > oldPrice) {
//         priceIncreased.push({
//           barcode,
//           name: product.name,
//           oldPrice,
//           newPrice: price,
//         });
//       } else {
//         priceDecreased.push({
//           barcode,
//           name: product.name,
//           oldPrice,
//           newPrice: price,
//         });
//       }
//     }

//     const missingInExcel = list.products
//       .filter((p) => !incomingBarcodesSet.has(p.barcode))
//       .map((p) => ({
//         barcode: p.barcode,
//         name: p.name,
//         currentPrice: p.currentPrice || 0,
//       }));

//     res.json({
//       message: `Actualización de precios para la lista "${list.name}"`,
//       priceIncreased,
//       priceDecreased,
//       priceUnchanged,
//       missingInExcel,
//       notInList,
//     });
//   } catch (error) {
//     console.error("Error al subir precios:", error);
//     res
//       .status(500)
//       .json({ message: "Error del servidor actualizando precios" });
//   }
// };

export const uploadPricesForList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Lista de productos vacía o inválida" });
    }

    const list = await ProductList.findById(listId).populate(
      "products",
      "barcode _id name currentPrice priceHistory"
    );
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const listBarcodesSet = new Set(list.products.map((p) => p.barcode));
    const incomingBarcodesSet = new Set(products.map((p) => p.barcode));

    const priceIncreased = [];
    const priceDecreased = [];
    const priceUnchanged = [];
    const firstTimeSet = [];
    const notInList = [];

    const nowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    for (const { barcode, price, stock } of products) {
      if (!barcode || typeof price !== "number") continue;

      if (!listBarcodesSet.has(barcode)) {
        notInList.push({ barcode, price });
        continue;
      }

      const product = list.products.find((p) => p.barcode === barcode);
      const oldPrice = product.currentPrice ?? 0;

      if (
        product.currentPrice === undefined ||
        product.currentPrice === null ||
        product.currentPrice === 0
      ) {
        // Primer precio real
        await Product.findByIdAndUpdate(product._id, { currentPrice: price });

        const history = await PriceHistory.create({
          productId: product._id,
          price,
          date: nowArgentina,
        });

        await Product.findByIdAndUpdate(product._id, {
          $push: { priceHistory: history._id },
        });

        firstTimeSet.push({
          barcode,
          name: product.name,
          newPrice: price,
        });
      } else if (price === oldPrice) {
        // Precio no cambió → pero puede no tener historial
        const fullProduct = await Product.findById(product._id);
        const hasHistory =
          fullProduct.priceHistory && fullProduct.priceHistory.length > 0;

        if (!hasHistory) {
          const history = await PriceHistory.create({
            productId: product._id,
            price,
            date: nowArgentina,
          });

          await Product.findByIdAndUpdate(product._id, {
            $push: { priceHistory: history._id },
          });

          firstTimeSet.push({
            barcode,
            name: product.name,
            newPrice: price,
          });
        } else {
          priceUnchanged.push({
            barcode,
            name: product.name,
            price,
          });
        }
      } else {
        // Precio cambió
        await Product.findByIdAndUpdate(product._id, { currentPrice: price });

        const history = await PriceHistory.create({
          productId: product._id,
          price,
          date: nowArgentina,
        });

        await Product.findByIdAndUpdate(product._id, {
          $push: { priceHistory: history._id },
        });

        const priceChange = {
          barcode,
          name: product.name,
          oldPrice,
          newPrice: price,
        };

        if (price > oldPrice) {
          priceIncreased.push(priceChange);
        } else {
          priceDecreased.push(priceChange);
        }
      }
    }

    const missingInExcel = list.products
      .filter((p) => !incomingBarcodesSet.has(p.barcode))
      .map((p) => ({
        barcode: p.barcode,
        name: p.name,
        currentPrice: p.currentPrice || 0,
      }));

    res.json({
      message: `Actualización de precios para la lista "${list.name}"`,
      priceIncreased,
      priceDecreased,
      priceUnchanged,
      firstTimeSet,
      missingInExcel,
      notInList,
    });
  } catch (error) {
    console.error("Error al subir precios:", error);
    res
      .status(500)
      .json({ message: "Error del servidor actualizando precios" });
  }
};

const runBatches = async (tasks, batchSize = 20) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
};

// export const uploadPricesForMultipleLists = async (req, res) => {
//   try {
//     const { products, listIds, fileName } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: "Lista de productos vacía" });
//     }

//     if (!Array.isArray(listIds) || listIds.length === 0) {
//       return res.status(400).json({ message: "No se indicaron listas a actualizar" });
//     }

//     const selectedLists = await ProductList.find({ _id: { $in: listIds } }).populate("products.product");
//     const nowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     const barcodesFromExcel = products.map((p) => p.barcode);
//     const notInAnyList = [];
//     const resultByList = [];

//     for (const list of selectedLists) {
//       const mapListProducts = new Map();
//       for (const item of list.products) {
//         if (item.product?.barcode) {
//           mapListProducts.set(item.product.barcode, item.product);
//         }
//       }

//       const changes = {
//         listId: list._id,
//         listName: list.name,
//         priceIncreased: [],
//         priceDecreased: [],
//         priceUnchanged: [],
//         firstTimeSet: [],
//         missingInExcel: [],
//       };

//       const updateTasks = [];

//       for (const { barcode, price } of products) {
//         if (!barcode || typeof price !== "number") continue;

//         const product = mapListProducts.get(barcode);
//         if (!product) continue;

//         updateTasks.push(async () => {
//           const fullProduct = await Product.findById(product._id).populate("priceHistory");

//           const hasHistory = fullProduct.priceHistory?.length > 0;

//           if (!hasHistory) {
//             await Product.findByIdAndUpdate(fullProduct._id, { currentPrice: price });

//             const history = await PriceHistory.create({
//               productId: fullProduct._id,
//               price,
//               date: nowArgentina,
//             });

//             await Product.findByIdAndUpdate(fullProduct._id, {
//               $push: { priceHistory: history._id },
//             });

//             changes.firstTimeSet.push({
//               _id: fullProduct._id,
//               barcode,
//               name: fullProduct.name,
//               newPrice: price,
//               lastTagDate: nowArgentina,
//             });
//           } else {
//             const lastEntry = [...fullProduct.priceHistory].sort(
//               (a, b) => new Date(b.date) - new Date(a.date)
//             )[0];
//             const oldPrice = lastEntry?.price ?? 0;

//             if (price === oldPrice) {
//               changes.priceUnchanged.push({
//                 _id: fullProduct._id,
//                 barcode,
//                 name: fullProduct.name,
//                 price,
//               });
//             } else {
//               await Product.findByIdAndUpdate(fullProduct._id, { currentPrice: price });

//               const history = await PriceHistory.create({
//                 productId: fullProduct._id,
//                 price,
//                 date: nowArgentina,
//               });

//               await Product.findByIdAndUpdate(fullProduct._id, {
//                 $push: { priceHistory: history._id },
//               });

//               const entry = {
//                 _id: fullProduct._id,
//                 barcode,
//                 name: fullProduct.name,
//                 oldPrice,
//                 newPrice: price,
//                  lastTagDate: nowArgentina,
//               };

//               if (price > oldPrice) changes.priceIncreased.push(entry);
//               else changes.priceDecreased.push(entry);
//             }
//           }
//         });
//       }

//       await runBatches(updateTasks, 20);

//       // ✅ Actualizar lastTagDate solo a productos con cambios
//       const productosParaEtiquetar = [
//         ...changes.priceIncreased,
//         ...changes.priceDecreased,
//         ...changes.firstTimeSet,
//       ];

//       for (const prod of productosParaEtiquetar) {
//         await ProductList.updateOne(
//           {
//             _id: list._id,
//             "products.product": prod._id,
//           },
//           {
//             $set: {
//               "products.$.lastTagDate": nowArgentina,
//             },
//           }
//         );
//       }

//       // Marcar productos de la lista que no están en el Excel
//       for (const item of list.products) {
//         const prod = item.product;
//         if (prod?.barcode && !barcodesFromExcel.includes(prod.barcode)) {
//           changes.missingInExcel.push({
//             barcode: prod.barcode,
//             name: prod.name,
//             price: prod.currentPrice ?? 0,
//             lastTagDate: item.lastTagDate ?? null,
//           });
//         }
//       }

//       resultByList.push(changes);
//     }

//     // Productos del Excel que no están en ninguna lista
//     const allListBarcodes = new Set(
//       selectedLists.flatMap((list) =>
//         list.products.map((item) => item.product?.barcode)
//       )
//     );

//     for (const { barcode, price } of products) {
//       if (!allListBarcodes.has(barcode)) {
//         notInAnyList.push({ barcode, price });
//       }
//     }

//     // Guardar logs
//     for (const listResult of resultByList) {
//       await PriceUploadLog.create({
//         uploadedBy: req.user?._id || null,
//         listId: listResult.listId,
//         listName: listResult.listName,
//         fileName: fileName || null,
//         createdAt: nowArgentina,
//         priceIncreased: listResult.priceIncreased,
//         priceDecreased: listResult.priceDecreased,
//         priceUnchanged: listResult.priceUnchanged,
//         firstTimeSet: listResult.firstTimeSet,
//         missingInExcel: listResult.missingInExcel,
//         notInAnyList,
//       });
//     }

//     res.json({
//       message: `Precios actualizados para ${selectedLists.length} listas`,
//       lists: resultByList,
//       notInAnyList,
//     });
//   } catch (error) {
//     console.error("Error al subir precios para múltiples listas:", error);
//     res.status(500).json({ message: "Error del servidor" });
//   }
// };

export const uploadPricesForMultipleLists = async (req, res) => {
  try {
    const { products, listIds, fileName, branchId } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Lista de productos vacía" });
    }

    if (!Array.isArray(listIds) || listIds.length === 0) {
      return res.status(400).json({ message: "No se indicaron listas a actualizar" });
    }

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    const nowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    const barcodesFromExcel = products.map((p) => p.barcode?.trim()).filter(Boolean);
    const notInAnyList = [];
    const resultByList = [];

    for (const list of selectedLists) {
      const mapListProducts = new Map();
      for (const item of list.products) {
        if (item.product?.barcode) {
          mapListProducts.set(item.product.barcode.trim(), {
            product: item.product,
            lastTagDate: item.lastTagDate,
          });
        }
      }

      const changes = {
        listId: list._id,
        listName: list.name,
        priceIncreased: [],
        priceDecreased: [],
        priceUnchanged: [],
        firstTimeSet: [],
        missingInExcel: [],
        stockUpdated: [],
      };

      const updateTasks = [];

      for (const { barcode, price, stock } of products) {
        if (!barcode || typeof price !== "number") continue;

        updateTasks.push(async () => {
          const cleanBarcode = barcode.trim();
          const productEntry = mapListProducts.get(cleanBarcode);
          if (!productEntry || !productEntry.product) return;

          const { product, lastTagDate } = productEntry;

          const fullProduct = await Product.findById(product._id).populate("priceHistory");
          const hasHistory = fullProduct.priceHistory?.length > 0;
          const isFirstTag = !lastTagDate;

          if (!hasHistory || isFirstTag) {
            // Primera etiqueta o sin historial
            await Product.findByIdAndUpdate(fullProduct._id, {
              currentPrice: price,
            });

            const history = await PriceHistory.create({
              productId: fullProduct._id,
              price,
              date: nowArgentina,
            });

            await Product.findByIdAndUpdate(fullProduct._id, {
              $push: { priceHistory: history._id },
            });

            changes.firstTimeSet.push({
              _id: fullProduct._id,
              barcode: cleanBarcode,
              name: fullProduct.name,
              newPrice: price,
              lastTagDate: nowArgentina,
            });
          } else {
            const lastEntry = [...fullProduct.priceHistory].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            )[0];
            const oldPrice = lastEntry?.price ?? 0;

            if (price === oldPrice) {
              changes.priceUnchanged.push({
                _id: fullProduct._id,
                barcode: cleanBarcode,
                name: fullProduct.name,
                price,
                stock,
              });
            } else {
              await Product.findByIdAndUpdate(fullProduct._id, {
                currentPrice: price,
              });

              const history = await PriceHistory.create({
                productId: fullProduct._id,
                price,
                date: nowArgentina,
              });

              await Product.findByIdAndUpdate(fullProduct._id, {
                $push: { priceHistory: history._id },
              });

              const entry = {
                _id: fullProduct._id,
                barcode: cleanBarcode,
                name: fullProduct.name,
                oldPrice,
                newPrice: price,
                lastTagDate: nowArgentina,
                stock,
              };

              if (price > oldPrice) changes.priceIncreased.push(entry);
              else changes.priceDecreased.push(entry);
            }
          }

          // Stock
          if (branchId && typeof stock === "number") {
            await Stock.findOneAndUpdate(
              { product: fullProduct._id, branch: branchId },
              {
                $set: {
                  quantity: stock,
                  lastUpdated: nowArgentina,
                },
              },
              { upsert: true }
            );

            changes.stockUpdated.push({
              _id: fullProduct._id,
              barcode: cleanBarcode,
              name: fullProduct.name,
              stock,
            });
          }
        });
      }

      await runBatches(updateTasks, 20);

      const productosParaEtiquetar = [
        ...changes.priceIncreased,
        ...changes.priceDecreased,
        ...changes.firstTimeSet,
      ];

      for (const prod of productosParaEtiquetar) {
        await ProductList.updateOne(
          {
            _id: list._id,
            "products.product": prod._id,
          },
          {
            $set: {
              "products.$.lastTagDate": nowArgentina,
            },
          }
        );
      }

      for (const item of list.products) {
        const prod = item.product;
        if (prod?.barcode && !barcodesFromExcel.includes(prod.barcode.trim())) {
          changes.missingInExcel.push({
            barcode: prod.barcode,
            name: prod.name,
            price: prod.currentPrice ?? 0,
            lastTagDate: item.lastTagDate ?? null,
          });
        }
      }

      resultByList.push(changes);
    }

    // Productos que no están en ninguna lista
    const allListBarcodes = new Set(
      selectedLists.flatMap((list) =>
        list.products.map((item) => item.product?.barcode?.trim())
      )
    );

    for (const { barcode, price } of products) {
      const cleanBarcode = barcode?.trim();
      if (!allListBarcodes.has(cleanBarcode)) {
        notInAnyList.push({ barcode: cleanBarcode, price });
      }
    }

    // Guardar logs
    for (const listResult of resultByList) {
      await PriceUploadLog.create({
        uploadedBy: req.user?._id || null,
        listId: listResult.listId,
        listName: listResult.listName,
        fileName: fileName || null,
        createdAt: nowArgentina,
        priceIncreased: listResult.priceIncreased,
        priceDecreased: listResult.priceDecreased,
        priceUnchanged: listResult.priceUnchanged,
        firstTimeSet: listResult.firstTimeSet,
        missingInExcel: listResult.missingInExcel,
        notInAnyList,
        stockUpdated: listResult.stockUpdated,
      });
    }

    res.json({
      message: `Precios y stock actualizados para ${selectedLists.length} listas`,
      lists: resultByList,
      notInAnyList,
    });
  } catch (error) {
    console.error("❌ Error al subir precios y stock:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


export const getProductsToRetag = async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await ProductList.findById(listId).populate(
      "products.product"
    );
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const result = [];

    for (const item of list.products) {
      const product = item.product;
      if (!product) continue;

      const lastTagDate = item.lastTagDate ?? new Date(0); // si nunca fue etiquetado

      const lastPriceChange = await PriceHistory.findOne({
        productId: product._id,
      }).sort({
        date: -1,
      });

      if (lastPriceChange && lastTagDate < lastPriceChange.date) {
        result.push({
          _id: product._id,
          barcode: product.barcode,
          name: product.name,
          lastTagDate,
          lastPriceChange: lastPriceChange.date,
          currentPrice: product.currentPrice,
        });
      }
    }

    res.json({ productsToRetag: result });
  } catch (error) {
    console.error("Error al obtener productos a reetiquetar:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getUploadLogsForList = async (req, res) => {
  try {
    const { listId } = req.params;
    console.log("entra");
    const logs = await PriceUploadLog.find({ listId })
      .sort({ createdAt: -1 })
      .limit(20); // podés paginar si querés

    res.json({ logs });
  } catch (error) {
    console.error("Error al obtener logs de cargas de precios:", error);
    res.status(500).json({ message: "Error al obtener logs" });
  }
};
// controllers/productListController.js

export const getUploadLogs = async (req, res) => {
  //CON PAGINACION
  try {
    const { listId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      PriceUploadLog.find({ listId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PriceUploadLog.countDocuments({ listId }),
    ]);

    res.json({ logs, total });
  } catch (error) {
    console.error("Error al obtener logs:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getProductsToRetagByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { desde } = req.query; // fecha en formato ISO o yyyy-mm-dd

    if (!listId) {
      return res.status(400).json({ message: "Falta listId" });
    }
    if (!desde) {
      return res
        .status(400)
        .json({ message: "Falta parámetro 'desde' en query" });
    }

    const fecha = dayjs(desde).toDate();

    // Buscar lista con productos (populate product)
    const list = await ProductList.findById(listId).populate(
      "products.product"
    );
    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    const productosQueCambiarion = [];

    for (const item of list.products) {
      const product = item.product;
      if (!product) continue;

      const { barcode, name, currentPrice, priceHistory } = product;

      // priceHistory debe estar poblado, si no:
      // await product.populate("priceHistory");

      // Encontrar el precio más reciente anterior o igual a la fecha
      const oldEntry = priceHistory
        .filter((h) => h.date <= fecha)
        .sort((a, b) => b.date - a.date)[0];

      const oldPrice = oldEntry?.price ?? null;

      if (oldPrice === null) {
        productosQueCambiarion.push({
          barcode,
          name,
          currentPrice,
          reason: "No tenía precio antes de la fecha",
        });
        continue;
      }

      if (oldPrice !== currentPrice) {
        productosQueCambiarion.push({
          barcode,
          name,
          oldPrice,
          currentPrice,
          reason: "Cambio de precio desde la fecha",
        });
      }
    }

    return res.json({
      listId,
      listName: list.name,
      desde,
      productosQueCambiarion,
    });
  } catch (error) {
    console.error("Error en getProductsToRetagByList:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const comparePricesByDate = async (req, res) => {
  try {
    const { listId } = req.params;
    const { date } = req.query; // fecha en formato ISO o yyyy-mm-dd
    console.log("date", date);
    if (!date) {
      return res
        .status(400)
        .json({ message: "Se requiere la fecha para la comparación" });
    }

    const compareDate = dayjs(date).startOf("day").toDate();
    console.log("compareDate:::", compareDate);
    // Traemos la lista con sus productos y el priceHistory poblado
    const list = await ProductList.findById(listId).populate({
      path: "products.product",
      populate: { path: "priceHistory" },
    });

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const results = [];

    for (const item of list.products) {
      const product = item.product;
      if (!product) continue;
      // const start = dayjs(date).startOf("day").toDate(); // 00:00:00
      // const end = dayjs(date).endOf("day").toDate(); // 23:59:59
      const start = dayjs(date)
        .tz("America/Argentina/Buenos_Aires")
        .startOf("day")
        .toDate();
      const end = dayjs(date)
        .tz("America/Argentina/Buenos_Aires")
        .endOf("day")
        .toDate();
      const priceHistory = await PriceHistory.findOne({
        productId: product._id,
        date: { $gte: start, $lte: end },
      })
        .sort({ date: -1 })
        .lean();

      results.push({
        barcode: product.barcode,
        name: product.name,
        priceAtDate: priceHistory?.price ?? null,
        currentPrice: product.currentPrice ?? null,
        needsRetag: priceHistory?.price !== product.currentPrice,
        lastTagDate: item.lastTagDate ?? null,
      });
    }
    results.sort((a, b) => {
      if (a.needsRetag && !b.needsRetag) return -1;
      if (!a.needsRetag && b.needsRetag) return 1;
      return 0; // mantienen orden relativo si ambos son iguales
    });

    res.json({
      listId,
      compareDate,
      totalProducts: results.length,
      products: results,
    });
  } catch (err) {
    console.error("Error en comparePricesByDate:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// POST /product-lists/:listId/add-multiple
export const addMultipleProductsToList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { barcodes } = req.body;

    if (!Array.isArray(barcodes)) {
      return res
        .status(400)
        .json({ message: "Se requiere un array de códigos" });
    }

    const list = await ProductList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    const existingCodes = new Set(
      list.products.map((p) => p.product.toString())
    );

    const added = [];
    const missing = [];

    for (const code of barcodes) {
      const product = await Product.findOne({ barcode: code.trim() });
      if (!product) {
        missing.push(code);
        continue;
      }

      if (existingCodes.has(product._id.toString())) {
        continue; // ya está en la lista
      }

      list.products.push({ product: product._id });
      added.push(product);
    }

    await list.save();

    res.json({
      added: added.map((p) => ({
        _id: p._id,
        name: p.name,
        barcode: p.barcode,
      })),
      missing,
      totalAdded: added.length,
      totalMissing: missing.length,
    });
  } catch (err) {
    console.error("Error en addMultipleProductsToList:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const removeMultipleProductsFromList = async (req, res) => {
  const { listId } = req.params;
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    return res.status(400).json({ message: "Se requiere un array de IDs" });
  }

  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const originalCount = list.products.length;

    list.products = list.products.filter(
      (entry) => !productIds.includes(entry.product.toString())
    );

    const removedCount = originalCount - list.products.length;

    await list.save();

    res.json({ removedCount });
  } catch (err) {
    console.error("Error al eliminar múltiples productos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateTagDate = async (req, res) => {
  const { listId, productId } = req.params;
  const { date } = req.body;

  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const item = list.products.find((p) => p.product.toString() === productId);
    if (!item)
      return res
        .status(404)
        .json({ message: "Producto no encontrado en la lista" });

    item.lastTagDate = new Date(date);

    await list.save();
    res.json({ message: "Fecha actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar fecha de etiqueta:", err);
    res.status(500).json({ message: "Error al actualizar la fecha" });
  }
};
