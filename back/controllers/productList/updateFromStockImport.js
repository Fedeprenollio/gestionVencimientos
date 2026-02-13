import ProductList from "../../models/ProductList.js";
import Product from "../../models/Product.js";
import Stock from "../../models/Stock.js";
import PriceHistory from "../../models/PriceHistory.js";
import StockImport from "../../models/StockImport.js";
import PriceUploadLog from "../../models/PriceUploadLog.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
import "dayjs/plugin/timezone.js";
import "dayjs/plugin/utc.js";
import { runBatches } from "../productListController.js";

// export const updateFromStockImport = async (req, res) => {
//   try {
//     const { importId, listIds } = req.body;
//     if (!importId || !listIds || !Array.isArray(listIds)) {
//       return res
//         .status(400)
//         .json({ message: "Faltan datos requeridos: importId y listIds" });
//     }

//     const stockImport = await StockImport.findById(importId);
//     if (!stockImport)
//       return res.status(404).json({ message: "Importación no encontrada" });

//     const selectedLists = await ProductList.find({
//       _id: { $in: listIds },
//     }).populate("products.product");

//     const barcodesInLists = new Set(
//       selectedLists.flatMap((list) =>
//         list.products
//           .map((item) => item.product?.barcode?.trim())
//           .filter(Boolean)
//       )
//     );

//     const relevantRows = stockImport.rows.filter(
//       (row) => row.barcode && barcodesInLists.has(row.barcode.trim())
//     );

//     // Agrupar por código de barras
//     const groupedRowsMap = new Map();
//     for (const row of relevantRows) {
//       const barcode = row.barcode?.trim();
//       if (!barcode) continue;

//       if (!groupedRowsMap.has(barcode)) {
//         groupedRowsMap.set(barcode, {
//           totalStock: row.stock ?? 0,
//           bestRow: row.stock > 0 ? row : null,
//           fallbackRow: row,
//         });
//       } else {
//         const existing = groupedRowsMap.get(barcode);
//         const totalStock = (existing.totalStock ?? 0) + (row.stock ?? 0);
//         const bestRow =
//           row.stock > 0 &&
//           (!existing.bestRow || row.stock > existing.bestRow.stock)
//             ? row
//             : existing.bestRow;

//         groupedRowsMap.set(barcode, {
//           totalStock,
//           bestRow,
//           fallbackRow: existing.fallbackRow,
//         });
//       }
//     }

//     // Reconstruir filas con datos consolidados
//     const consolidatedRows = [];
//     for (const [
//       barcode,
//       { totalStock, bestRow, fallbackRow },
//     ] of groupedRowsMap.entries()) {
//       const sourceRow = bestRow || fallbackRow;
//       consolidatedRows.push({
//         barcode,
//         name: sourceRow.name ?? "",
//         price: sourceRow.price ?? 0,
//         cost: sourceRow.cost ?? 0,
//         category: sourceRow.category ?? "",
//         lab: sourceRow.lab ?? "",
//         barcodes: sourceRow.barcodes ?? [],
//         stock: totalStock,
//       });
//     }

//     const { branch } = stockImport;
//     const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     const barcodes = consolidatedRows.map((r) => r.barcode);
//     const products = await Product.find({
//       barcode: { $in: barcodes },
//     }).populate("priceHistory");
//     const productsMap = new Map(products.map((p) => [p.barcode.trim(), p]));

//     const existingStocks = await Stock.find({
//       branch,
//       product: { $in: products.map((p) => p._id) },
//     });
//     const stockMap = new Map(
//       existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
//     );

//     const bulkProductUpdates = [];
//     const bulkProductInserts = [];
//     const bulkStockOps = [];
//     const seenInsertStockKeys = new Set();
//     const priceHistories = [];

//     for (const row of consolidatedRows) {
//       const barcode = row.barcode.trim();
//       if (typeof row.price !== "number") continue;

//       let product = productsMap.get(barcode);

//       if (product) {
//         const oldPrice = product.currentPrice ?? 0;
//         const newPrice = row.price;

//         if (oldPrice !== newPrice) {
//           priceHistories.push({
//             productId: product._id,
//             price: newPrice,
//             date: now,
//           });
//         }

//         bulkProductUpdates.push({
//           updateOne: {
//             filter: { _id: product._id },
//             update: {
//               $set: {
//                 name: row.name || product.name,
//                 currentPrice: newPrice,
//                 cost: row.cost,
//                 category: row.category || product.category,
//                 lab: row.lab || product.lab,
//                 barcodes: row.barcodes || product.barcodes,
//               },
//             },
//           },
//         });

//         const stockKey = `${product._id}_${branch}`;
//         const existingStock = stockMap.get(stockKey);
//         if (existingStock) {
//           bulkStockOps.push({
//             updateOne: {
//               filter: { _id: existingStock._id },
//               update: {
//                 $set: {
//                   quantity: row.stock,
//                   lastUpdated: now,
//                 },
//               },
//             },
//           });
//         } else if (!seenInsertStockKeys.has(stockKey)) {
//           seenInsertStockKeys.add(stockKey);
//           bulkStockOps.push({
//             insertOne: {
//               document: {
//                 product: product._id,
//                 branch,
//                 quantity: row.stock,
//                 lastUpdated: now,
//               },
//             },
//           });
//         }
//       } else {
//         bulkProductInserts.push({
//           barcode,
//           name: row.name,
//           currentPrice: row.price,
//           cost: row.cost,
//           category: row.category,
//           lab: row.lab,
//           barcodes: row.barcodes || [],
//         });
//       }
//     }

//     if (bulkProductInserts.length > 0) {
//       const inserted = await Product.insertMany(bulkProductInserts);
//       inserted.forEach((p) => productsMap.set(p.barcode.trim(), p));
//     }

//     if (bulkProductUpdates.length > 0)
//       await Product.bulkWrite(bulkProductUpdates);
//     if (bulkStockOps.length > 0) await Stock.bulkWrite(bulkStockOps);

//     if (priceHistories.length > 0) {
//       const insertedHistories = await PriceHistory.insertMany(priceHistories);
//       const updatesByProduct = new Map();
//       for (const h of insertedHistories) {
//         if (!updatesByProduct.has(h.productId))
//           updatesByProduct.set(h.productId, []);
//         updatesByProduct.get(h.productId).push(h._id);
//       }

//       for (const [productId, historyIds] of updatesByProduct.entries()) {
//         await Product.findByIdAndUpdate(productId, {
//           $push: { priceHistory: { $each: historyIds } },
//         });
//       }
//     }

//     const resultByList = [];
//     const notInAnyList = [];

//     for (const list of selectedLists) {
//       const listResult = {
//         listId: list._id,
//         listName: list.name,
//         priceIncreased: [],
//         priceDecreased: [],
//         priceUnchanged: [],
//         firstTimeSet: [],
//         missingInImport: [],
//         stockUpdated: [],
//       };

//       const barcodesInImport = new Set(barcodes);

//       for (const { product, lastTagDate } of list.products) {
//         const barcode = product?.barcode?.trim();
//         if (!barcode || !productsMap.has(barcode)) continue;

//         const imported = consolidatedRows.find(
//           (r) => r.barcode.trim() === barcode
//         );
//         if (!imported || typeof imported.price !== "number") continue;

//         const current = productsMap.get(barcode);
//         const oldPrice = product.currentPrice ?? 0;
//         const newPrice = imported.price;

//         const isFirst = !lastTagDate;
//         if (isFirst) {
//           listResult.firstTimeSet.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else if (newPrice > oldPrice) {
//           listResult.priceIncreased.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else if (newPrice < oldPrice) {
//           listResult.priceDecreased.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else {
//           listResult.priceUnchanged.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             price: newPrice,
//           });
//         }

//         listResult.stockUpdated.push({
//           _id: product._id,
//           barcode,
//           name: product.name,
//           stock: imported.stock,
//         });
//       }

//       for (const { product } of list.products) {
//         const barcode = product?.barcode?.trim();
//         if (barcode && !barcodesInImport.has(barcode)) {
//           listResult.missingInImport.push({
//             barcode,
//             name: product.name,
//             price: product.currentPrice,
//             lastTagDate: product.lastTagDate ?? null,
//           });
//         }
//       }

//       await PriceUploadLog.create({
//         uploadedBy: req.user?._id || null,
//         listId: list._id,
//         listName: list.name,
//         fileName: `Importación ID: ${importId}`,
//         createdAt: now,
//         priceIncreased: listResult.priceIncreased,
//         priceDecreased: listResult.priceDecreased,
//         priceUnchanged: listResult.priceUnchanged,
//         firstTimeSet: listResult.firstTimeSet,
//         missingInExcel: listResult.missingInImport,
//         notInAnyList: [],
//         stockUpdated: listResult.stockUpdated,
//       });

//       resultByList.push(listResult);

//       const productosParaEtiquetar = [
//         ...listResult.priceIncreased,
//         ...listResult.priceDecreased,
//         ...listResult.firstTimeSet,
//       ];

//       await Promise.all(
//         productosParaEtiquetar.map((prod) =>
//           ProductList.updateOne(
//             {
//               _id: list._id,
//               "products.product": prod._id,
//             },
//             {
//               $set: {
//                 "products.$.lastTagDate": now,
//               },
//             }
//           )
//         )
//       );
//     }

//     const allBarcodesInLists = new Set(
//       selectedLists.flatMap((l) =>
//         l.products.map((p) => p.product?.barcode?.trim())
//       )
//     );

//     for (const row of consolidatedRows) {
//       const barcode = row.barcode?.trim();
//       if (barcode && !allBarcodesInLists.has(barcode)) {
//         notInAnyList.push({ barcode, price: row.price });
//       }
//     }

//     stockImport.status = "applied";
//     await stockImport.save();

//     res.json({
//       message: "Precios y stock actualizados desde la importación",
//       lists: resultByList,
//       notInAnyList,
//     });
//   } catch (error) {
//     console.error("❌ Error al actualizar desde importación:", error);
//     res.status(500).json({ message: "Error del servidor" });
//   }
// };





// export const updateFromStockImport = async (req, res) => {
//   console.log("HOLITA");

//   try {
//     const { importId, listIds } = req.body;

//     if (!importId || !listIds || !Array.isArray(listIds)) {
//       return res
//         .status(400)
//         .json({ message: "Faltan datos requeridos: importId y listIds" });
//     }

//     const stockImport = await StockImport.findById(importId);
//     if (!stockImport) {
//       return res.status(404).json({ message: "Importación no encontrada" });
//     }

//     const selectedLists = await ProductList.find({
//       _id: { $in: listIds },
//     }).populate("products.product");

//     /**
//      * Helpers
//      */
//     const normalize = (v) => {
//       if (!v) return null;
//       return String(v).trim();
//     };

//     /**
//      * 1) SET con TODOS los códigos de las listas:
//      * - barcode principal
//      * - alternateBarcodes (del Product)
//      */
//     const barcodesInLists = new Set(
//       selectedLists.flatMap((list) =>
//         list.products.flatMap((item) => {
//           const p = item.product;

//           const main = p?.barcode ? normalize(p.barcode) : null;

//           // ✅ ACÁ: alternateBarcodes (NO barcodes)
//           const alts = (p?.alternateBarcodes || []).map((b) => normalize(b));

//           return [main, ...alts].filter(Boolean);
//         })
//       )
//     );

//     /**
//      * 2) Filtrar rows del import por códigos relevantes
//      * (import trae row.barcode como principal y row.barcodes como alternativos)
//      */
//     const relevantRows = stockImport.rows.filter((row) => {
//       const bc = row?.barcode ? normalize(row.barcode) : null;
//       if (!bc) return false;
//       return barcodesInLists.has(bc);
//     });

//     /**
//      * 3) Agrupar por barcode del import
//      *    (si viene repetido, sumamos stock y elegimos la mejor row)
//      */
//     const groupedRowsMap = new Map();

//     for (const row of relevantRows) {
//       const barcode = row?.barcode ? normalize(row.barcode) : null;
//       if (!barcode) continue;

//       const stock = typeof row.stock === "number" ? row.stock : 0;

//       if (!groupedRowsMap.has(barcode)) {
//         groupedRowsMap.set(barcode, {
//           totalStock: stock,
//           bestRow: stock > 0 ? row : null,
//           fallbackRow: row,
//         });
//       } else {
//         const existing = groupedRowsMap.get(barcode);

//         const totalStock = (existing.totalStock ?? 0) + stock;

//         const bestRow =
//           stock > 0 &&
//           (!existing.bestRow || (existing.bestRow?.stock ?? 0) < stock)
//             ? row
//             : existing.bestRow;

//         groupedRowsMap.set(barcode, {
//           totalStock,
//           bestRow,
//           fallbackRow: existing.fallbackRow,
//         });
//       }
//     }

//     /**
//      * 4) Reconstruir filas consolidadas
//      */
//     const consolidatedRows = [];

//     for (const [
//       barcode,
//       { totalStock, bestRow, fallbackRow },
//     ] of groupedRowsMap.entries()) {
//       const sourceRow = bestRow || fallbackRow;

//       consolidatedRows.push({
//         barcode: normalize(barcode), // viene del import
//         name: sourceRow.name ?? "",
//         price: Number(sourceRow.price) ?? 0,
//         cost: Number(sourceRow.cost) ?? 0,
//         category: sourceRow.category ?? "",
//         lab: sourceRow.lab ?? "",

//         // row.barcodes viene del import
//         barcodes: Array.isArray(sourceRow.barcodes)
//           ? sourceRow.barcodes.map((b) => normalize(b)).filter(Boolean)
//           : [],

//         stock: totalStock ?? 0,
//       });
//     }

//     const { branch } = stockImport;
//     const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     /**
//      * 5) Buscar productos por:
//      * - barcode principal
//      * - alternateBarcodes
//      */
//     const importBarcodes = consolidatedRows
//       .map((r) => normalize(r.barcode))
//       .filter(Boolean);

//     const products = await Product.find({
//       $or: [
//         { barcode: { $in: importBarcodes } },
//         { alternateBarcodes: { $in: importBarcodes } },
//       ],
//     }).populate("priceHistory");

//     /**
//      * 6) productsMap:
//      *    clave = cualquier barcode (principal o alternativo)
//      *    valor = producto
//      */
//     const productsMap = new Map();

//     for (const p of products) {
//       if (p?.barcode) {
//         productsMap.set(normalize(p.barcode), p);
//       }

//       // ✅ ACÁ: alternateBarcodes
//       for (const alt of p?.alternateBarcodes || []) {
//         if (!alt) continue;
//         productsMap.set(normalize(alt), p);
//       }
//     }

//     /**
//      * 7) Stocks existentes SOLO para productos encontrados
//      */
//     const existingStocks = await Stock.find({
//       branch,
//       product: { $in: products.map((p) => p._id) },
//     });

//     const stockMap = new Map(
//       existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
//     );

//     const bulkProductUpdates = [];
//     const bulkProductInserts = [];
//     const bulkStockOps = [];
//     const seenInsertStockKeys = new Set();
//     const priceHistories = [];

//     /**
//      * 8) Actualizar/insertar productos + stock
//      */
//     for (const row of consolidatedRows) {
//       const scannedBarcode = normalize(row.barcode);
//       if (!scannedBarcode) continue;

//       const newPrice = Number(row.price);
//       if (Number.isNaN(newPrice)) continue;

//       let product = productsMap.get(scannedBarcode);

//       /**
//        * Si existe producto:
//        */
//       if (product) {
//         const oldPrice = product.currentPrice ?? 0;

//         if (oldPrice !== newPrice) {
//           priceHistories.push({
//             productId: product._id,
//             price: newPrice,
//             date: now,
//           });
//         }

//         bulkProductUpdates.push({
//           updateOne: {
//             filter: { _id: product._id },
//             update: {
//               $set: {
//                 name: row.name || product.name,
//                 currentPrice: newPrice,
//                 cost: row.cost,
//                 category: row.category || product.category,
//                 lab: row.lab || product.lab,

//                 // ⚠️ IMPORTANTE:
//                 // NO sobrescribimos alternateBarcodes del producto con row.barcodes
//                 // porque row.barcodes viene del Excel, y tu esquema usa alternateBarcodes
//               },
//             },
//           },
//         });

//         const stockKey = `${product._id}_${branch}`;
//         const existingStock = stockMap.get(stockKey);

//         if (existingStock) {
//           bulkStockOps.push({
//             updateOne: {
//               filter: { _id: existingStock._id },
//               update: {
//                 $set: {
//                   quantity: row.stock,
//                   lastUpdated: now,
//                 },
//               },
//             },
//           });
//         } else if (!seenInsertStockKeys.has(stockKey)) {
//           seenInsertStockKeys.add(stockKey);

//           bulkStockOps.push({
//             insertOne: {
//               document: {
//                 product: product._id,
//                 branch,
//                 quantity: row.stock,
//                 lastUpdated: now,
//               },
//             },
//           });
//         }
//       } else {
//         /**
//          * Si NO existe producto:
//          * lo insertamos.
//          * (acá sí seteamos alternateBarcodes)
//          */
//         bulkProductInserts.push({
//           barcode: scannedBarcode,
//           name: row.name,
//           currentPrice: newPrice,
//           cost: row.cost,
//           category: row.category,
//           lab: row.lab,

//           // ✅ IMPORTANTE: tu schema usa alternateBarcodes
//           alternateBarcodes: row.barcodes || [],
//         });
//       }
//     }

//     /**
//      * 9) Insertar productos nuevos y agregarlos al map
//      */
//     if (bulkProductInserts.length > 0) {
//       const inserted = await Product.insertMany(bulkProductInserts);

//       for (const p of inserted) {
//         if (p?.barcode) productsMap.set(normalize(p.barcode), p);

//         for (const alt of p?.alternateBarcodes || []) {
//           if (!alt) continue;
//           productsMap.set(normalize(alt), p);
//         }
//       }
//     }

//     if (bulkProductUpdates.length > 0) {
//       await Product.bulkWrite(bulkProductUpdates);
//     }

//     if (bulkStockOps.length > 0) {
//       await Stock.bulkWrite(bulkStockOps);
//     }

//     /**
//      * 10) PriceHistory
//      */
//     if (priceHistories.length > 0) {
//       const insertedHistories = await PriceHistory.insertMany(priceHistories);

//       const updatesByProduct = new Map();

//       for (const h of insertedHistories) {
//         if (!updatesByProduct.has(h.productId)) {
//           updatesByProduct.set(h.productId, []);
//         }
//         updatesByProduct.get(h.productId).push(h._id);
//       }

//       for (const [productId, historyIds] of updatesByProduct.entries()) {
//         await Product.findByIdAndUpdate(productId, {
//           $push: { priceHistory: { $each: historyIds } },
//         });
//       }
//     }

//     /**
//      * 11) RESULTADOS POR LISTA
//      */
//     const resultByList = [];
//     const notInAnyList = [];

//     /**
//      * Set de códigos del import (incluyendo alternativos que vengan en la row)
//      */
//     const barcodesInImport = new Set(
//       consolidatedRows.flatMap((r) => {
//         const main = r?.barcode ? normalize(r.barcode) : null;
//         const alts = (r?.barcodes || []).map((b) => normalize(b));
//         return [main, ...alts].filter(Boolean);
//       })
//     );

//     /**
//      * Helper: buscar la row del import por:
//      * - barcode principal del producto
//      * - cualquier alternateBarcode del producto
//      */
//     const findImportRowForProduct = (product) => {
//       const candidates = [
//         product?.barcode ? normalize(product.barcode) : null,
//         ...(product?.alternateBarcodes || []).map((b) => normalize(b)),
//       ].filter(Boolean);

//       for (const code of candidates) {
//         const row = consolidatedRows.find((r) => normalize(r.barcode) === code);
//         if (row) return row;
//       }

//       return null;
//     };

//     for (const list of selectedLists) {
//       const listResult = {
//         listId: list._id,
//         listName: list.name,
//         priceIncreased: [],
//         priceDecreased: [],
//         priceUnchanged: [],
//         firstTimeSet: [],
//         missingInImport: [],
//         stockUpdated: [],
//       };

//       for (const { product, lastTagDate } of list.products) {
//         if (!product) continue;

//         const imported = findImportRowForProduct(product);

//         if (!imported) continue;

//         const newPrice = Number(imported.price);
//         if (Number.isNaN(newPrice)) continue;

//         const oldPrice = product.currentPrice ?? 0;
//         const isFirst = !lastTagDate;

//         const mainBarcode = product?.barcode ? normalize(product.barcode) : null;
//         const scannedBarcode = imported?.barcode
//           ? normalize(imported.barcode)
//           : mainBarcode;

//         if (isFirst) {
//           listResult.firstTimeSet.push({
//             _id: product._id,
//             barcode: mainBarcode || scannedBarcode,
//             scannedBarcode,
//             name: product.name,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else if (newPrice > oldPrice) {
//           listResult.priceIncreased.push({
//             _id: product._id,
//             barcode: mainBarcode || scannedBarcode,
//             scannedBarcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else if (newPrice < oldPrice) {
//           listResult.priceDecreased.push({
//             _id: product._id,
//             barcode: mainBarcode || scannedBarcode,
//             scannedBarcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//             lastTagDate: now,
//           });
//         } else {
//           listResult.priceUnchanged.push({
//             _id: product._id,
//             barcode: mainBarcode || scannedBarcode,
//             scannedBarcode,
//             name: product.name,
//             price: newPrice,
//             lastTagDate: product.lastTagDate || null

//           });
//         }

//         listResult.stockUpdated.push({
//           _id: product._id,
//           barcode: mainBarcode || scannedBarcode,
//           scannedBarcode,
//           name: product.name,
//           stock: imported.stock,
//           lastTagDate: product.lastTagDate || null

//         });
//       }

//       /**
//        * missingInImport:
//        * Si NI el principal NI ningún alternateBarcode está en el import => falta
//        */
//       for (const { product } of list.products) {
//         if (!product) continue;

//         const candidates = [
//           product?.barcode ? normalize(product.barcode) : null,
//           ...(product?.alternateBarcodes || []).map((b) => normalize(b)),
//         ].filter(Boolean);

//         const found = candidates.some((code) => barcodesInImport.has(code));

//         if (!found) {
//           const mainBarcode = product?.barcode ? normalize(product.barcode) : null;

//           listResult.missingInImport.push({
//             barcode: mainBarcode || "—",
//             name: product.name,
//             price: product.currentPrice,
//             lastTagDate: product.lastTagDate ?? null,
//           });
//         }
//       }

//       /**
//        * Logs
//        */
//       await PriceUploadLog.create({
//         uploadedBy: req.user?._id || null,
//         listId: list._id,
//         listName: list.name,
//         fileName: `Importación ID: ${importId}`,
//         createdAt: now,
//         priceIncreased: listResult.priceIncreased,
//         priceDecreased: listResult.priceDecreased,
//         priceUnchanged: listResult.priceUnchanged,
//         firstTimeSet: listResult.firstTimeSet,
//         missingInExcel: listResult.missingInImport,
//         notInAnyList: [],
//         stockUpdated: listResult.stockUpdated,
//       });

//       resultByList.push(listResult);

//       /**
//        * Marcar lastTagDate sólo para productos que se re-etiquetan
//        */
//       const productosParaEtiquetar = [
//         ...listResult.priceIncreased,
//         ...listResult.priceDecreased,
//         ...listResult.firstTimeSet,
//       ];

//       await Promise.all(
//         productosParaEtiquetar.map((prod) =>
//           ProductList.updateOne(
//             {
//               _id: list._id,
//               "products.product": prod._id,
//             },
//             {
//               $set: {
//                 "products.$.lastTagDate": now,
//               },
//             }
//           )
//         )
//       );
//     }

//     /**
//      * 12) notInAnyList:
//      *     si el import trae códigos que no están en ninguna lista
//      */
//     const allBarcodesInLists = new Set(
//       selectedLists.flatMap((l) =>
//         l.products.flatMap((p) => {
//           const prod = p.product;

//           const main = prod?.barcode ? normalize(prod.barcode) : null;

//           // ✅ alternateBarcodes
//           const alts = (prod?.alternateBarcodes || []).map((b) => normalize(b));

//           return [main, ...alts].filter(Boolean);
//         })
//       )
//     );

//     for (const row of consolidatedRows) {
//       const bc = row?.barcode ? normalize(row.barcode) : null;
//       if (!bc) continue;

//       if (!allBarcodesInLists.has(bc)) {
//         notInAnyList.push({ barcode: bc, price: row.price });
//       }
//     }

//     stockImport.status = "applied";
//     await stockImport.save();

//     return res.json({
//       message: "Precios y stock actualizados desde la importación",
//       lists: resultByList,
//       notInAnyList,
//     });
//   } catch (error) {
//     console.error("❌ Error al actualizar desde importación:", error);
//     return res.status(500).json({ message: "Error del servidor" });
//   }
// };

export const updateFromStockImport = async (req, res) => {
  console.log("HOLITA");

  try {
    const { importId, listIds } = req.body;

    if (!importId || !listIds || !Array.isArray(listIds)) {
      return res
        .status(400)
        .json({ message: "Faltan datos requeridos: importId y listIds" });
    }

    const stockImport = await StockImport.findById(importId);
    if (!stockImport) {
      return res.status(404).json({ message: "Importación no encontrada" });
    }

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    /**
     * Helpers
     */
    const normalize = (v) => {
      if (!v) return null;
      return String(v).trim();
    };

    /**
     * 1) SET con TODOS los códigos de las listas:
     * - barcode principal
     * - alternateBarcodes (del Product)
     */
    const barcodesInLists = new Set(
      selectedLists.flatMap((list) =>
        list.products.flatMap((item) => {
          const p = item.product;

          const main = p?.barcode ? normalize(p.barcode) : null;

          // ✅ alternateBarcodes (NO barcodes)
          const alts = (p?.alternateBarcodes || []).map((b) => normalize(b));

          return [main, ...alts].filter(Boolean);
        })
      )
    );

    /**
     * 2) Filtrar rows del import por códigos relevantes
     */
    const relevantRows = stockImport.rows.filter((row) => {
      const bc = row?.barcode ? normalize(row.barcode) : null;
      if (!bc) return false;
      return barcodesInLists.has(bc);
    });

    /**
     * 3) Agrupar por barcode del import
     *    (si viene repetido, sumamos stock y elegimos la mejor row)
     */
    const groupedRowsMap = new Map();

    for (const row of relevantRows) {
      const barcode = row?.barcode ? normalize(row.barcode) : null;
      if (!barcode) continue;

      const stock = typeof row.stock === "number" ? row.stock : 0;

      if (!groupedRowsMap.has(barcode)) {
        groupedRowsMap.set(barcode, {
          totalStock: stock,
          bestRow: stock > 0 ? row : null,
          fallbackRow: row,
        });
      } else {
        const existing = groupedRowsMap.get(barcode);

        const totalStock = (existing.totalStock ?? 0) + stock;

        const bestRow =
          stock > 0 &&
          (!existing.bestRow || (existing.bestRow?.stock ?? 0) < stock)
            ? row
            : existing.bestRow;

        groupedRowsMap.set(barcode, {
          totalStock,
          bestRow,
          fallbackRow: existing.fallbackRow,
        });
      }
    }

    /**
     * 4) Reconstruir filas consolidadas
     */
    const consolidatedRows = [];

    for (const [
      barcode,
      { totalStock, bestRow, fallbackRow },
    ] of groupedRowsMap.entries()) {
      const sourceRow = bestRow || fallbackRow;

      consolidatedRows.push({
        barcode: normalize(barcode), // viene del import
        name: sourceRow.name ?? "",
        price: Number(sourceRow.price) ?? 0,
        cost: Number(sourceRow.cost) ?? 0,
        category: sourceRow.category ?? "",
        lab: sourceRow.lab ?? "",

        // row.barcodes viene del import
        barcodes: Array.isArray(sourceRow.barcodes)
          ? sourceRow.barcodes.map((b) => normalize(b)).filter(Boolean)
          : [],

        stock: totalStock ?? 0,
      });
    }

    const { branch } = stockImport;
    const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    /**
     * 5) Buscar productos por:
     * - barcode principal
     * - alternateBarcodes
     */
    const importBarcodes = consolidatedRows
      .map((r) => normalize(r.barcode))
      .filter(Boolean);

    const products = await Product.find({
      $or: [
        { barcode: { $in: importBarcodes } },
        { alternateBarcodes: { $in: importBarcodes } },
      ],
    }).populate("priceHistory");

    /**
     * 6) productsMap:
     *    clave = cualquier barcode (principal o alternativo)
     *    valor = producto
     */
    const productsMap = new Map();

    for (const p of products) {
      if (p?.barcode) {
        productsMap.set(normalize(p.barcode), p);
      }

      for (const alt of p?.alternateBarcodes || []) {
        if (!alt) continue;
        productsMap.set(normalize(alt), p);
      }
    }

    /**
     * 7) Stocks existentes SOLO para productos encontrados
     */
    const existingStocks = await Stock.find({
      branch,
      product: { $in: products.map((p) => p._id) },
    });

    const stockMap = new Map(
      existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
    );

    const bulkProductUpdates = [];
    const bulkProductInserts = [];
    const bulkStockOps = [];
    const seenInsertStockKeys = new Set();
    const priceHistories = [];

    /**
     * 8) Actualizar/insertar productos + stock
     */
    for (const row of consolidatedRows) {
      const scannedBarcode = normalize(row.barcode);
      if (!scannedBarcode) continue;

      const newPrice = Number(row.price);
      if (Number.isNaN(newPrice)) continue;

      let product = productsMap.get(scannedBarcode);

      /**
       * Si existe producto:
       */
      if (product) {
        const oldPrice = product.currentPrice ?? 0;

        if (oldPrice !== newPrice) {
          priceHistories.push({
            productId: product._id,
            price: newPrice,
            date: now,
          });
        }

        bulkProductUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                name: row.name || product.name,
                currentPrice: newPrice,
                cost: row.cost,
                category: row.category || product.category,
                lab: row.lab || product.lab,
              },
            },
          },
        });

        const stockKey = `${product._id}_${branch}`;
        const existingStock = stockMap.get(stockKey);

        if (existingStock) {
          bulkStockOps.push({
            updateOne: {
              filter: { _id: existingStock._id },
              update: {
                $set: {
                  quantity: row.stock,
                  lastUpdated: now,
                },
              },
            },
          });
        } else if (!seenInsertStockKeys.has(stockKey)) {
          seenInsertStockKeys.add(stockKey);

          bulkStockOps.push({
            insertOne: {
              document: {
                product: product._id,
                branch,
                quantity: row.stock,
                lastUpdated: now,
              },
            },
          });
        }
      } else {
        /**
         * Si NO existe producto:
         * lo insertamos.
         */
        bulkProductInserts.push({
          barcode: scannedBarcode,
          name: row.name,
          currentPrice: newPrice,
          cost: row.cost,
          category: row.category,
          lab: row.lab,

          // tu schema usa alternateBarcodes
          alternateBarcodes: row.barcodes || [],
        });
      }
    }

    /**
     * 9) Insertar productos nuevos y agregarlos al map
     */
    if (bulkProductInserts.length > 0) {
      const inserted = await Product.insertMany(bulkProductInserts);

      for (const p of inserted) {
        if (p?.barcode) productsMap.set(normalize(p.barcode), p);

        for (const alt of p?.alternateBarcodes || []) {
          if (!alt) continue;
          productsMap.set(normalize(alt), p);
        }
      }
    }

    if (bulkProductUpdates.length > 0) {
      await Product.bulkWrite(bulkProductUpdates);
    }

    if (bulkStockOps.length > 0) {
      await Stock.bulkWrite(bulkStockOps);
    }

    /**
     * 10) PriceHistory
     */
    if (priceHistories.length > 0) {
      const insertedHistories = await PriceHistory.insertMany(priceHistories);

      const updatesByProduct = new Map();

      for (const h of insertedHistories) {
        if (!updatesByProduct.has(h.productId)) {
          updatesByProduct.set(h.productId, []);
        }
        updatesByProduct.get(h.productId).push(h._id);
      }

      for (const [productId, historyIds] of updatesByProduct.entries()) {
        await Product.findByIdAndUpdate(productId, {
          $push: { priceHistory: { $each: historyIds } },
        });
      }
    }

    /**
     * 11) RESULTADOS POR LISTA
     */
    const resultByList = [];
    const notInAnyList = [];

    /**
     * Set de códigos del import (incluyendo alternativos que vengan en la row)
     */
    const barcodesInImport = new Set(
      consolidatedRows.flatMap((r) => {
        const main = r?.barcode ? normalize(r.barcode) : null;
        const alts = (r?.barcodes || []).map((b) => normalize(b));
        return [main, ...alts].filter(Boolean);
      })
    );

    /**
     * Helper: buscar la row del import por:
     * - barcode principal del producto
     * - cualquier alternateBarcode del producto
     */
    const findImportRowForProduct = (product) => {
      const candidates = [
        product?.barcode ? normalize(product.barcode) : null,
        ...(product?.alternateBarcodes || []).map((b) => normalize(b)),
      ].filter(Boolean);

      for (const code of candidates) {
        const row = consolidatedRows.find((r) => normalize(r.barcode) === code);
        if (row) return row;
      }

      return null;
    };

    for (const list of selectedLists) {
      const listResult = {
        listId: list._id,
        listName: list.name,

        priceIncreased: [],
        priceDecreased: [],
        priceUnchanged: [],
        firstTimeSet: [],
        missingInImport: [],
        stockUpdated: [],
      };

      for (const { product, lastTagDate } of list.products) {
        if (!product) continue;

        const imported = findImportRowForProduct(product);
        if (!imported) continue;

        const newPrice = Number(imported.price);
        if (Number.isNaN(newPrice)) continue;

        const oldPrice = product.currentPrice ?? 0;

        // ✅ lastTagDate real (de la lista)
        const previousTagDate = lastTagDate || null;

        // Si nunca se etiquetó
        const isFirst = !previousTagDate;

        const mainBarcode = product?.barcode ? normalize(product.barcode) : null;

        // el código con el que apareció en el import
        const scannedBarcode = imported?.barcode
          ? normalize(imported.barcode)
          : mainBarcode;

        // si en esta corrida se va a etiquetar
        const taggedNow =
          isFirst || newPrice > oldPrice || newPrice < oldPrice;

        const taggedAt = taggedNow ? now : null;

        if (isFirst) {
          listResult.firstTimeSet.push({
            _id: product._id,
            barcode: mainBarcode || scannedBarcode,
            scannedBarcode,
            name: product.name,
            oldPrice,
            newPrice,
            previousTagDate,
            taggedNow,
            taggedAt,
          });
        } else if (newPrice > oldPrice) {
          listResult.priceIncreased.push({
            _id: product._id,
            barcode: mainBarcode || scannedBarcode,
            scannedBarcode,
            name: product.name,
            oldPrice,
            newPrice,
            previousTagDate,
            taggedNow,
            taggedAt,
          });
        } else if (newPrice < oldPrice) {
          listResult.priceDecreased.push({
            _id: product._id,
            barcode: mainBarcode || scannedBarcode,
            scannedBarcode,
            name: product.name,
            oldPrice,
            newPrice,
            previousTagDate,
            taggedNow,
            taggedAt,
          });
        } else {
          listResult.priceUnchanged.push({
            _id: product._id,
            barcode: mainBarcode || scannedBarcode,
            scannedBarcode,
            name: product.name,
            price: newPrice,
            previousTagDate,
            taggedNow,
            taggedAt,
          });
        }

        // Stock siempre se actualiza, pero puede no requerir etiqueta
        listResult.stockUpdated.push({
          _id: product._id,
          barcode: mainBarcode || scannedBarcode,
          scannedBarcode,
          name: product.name,
          stock: imported.stock,
          previousTagDate,
          taggedNow,
          taggedAt,
        });
      }

      /**
       * missingInImport:
       * Si NI el principal NI ningún alternateBarcode está en el import => falta
       */
      for (const { product, lastTagDate } of list.products) {
        if (!product) continue;

        const candidates = [
          product?.barcode ? normalize(product.barcode) : null,
          ...(product?.alternateBarcodes || []).map((b) => normalize(b)),
        ].filter(Boolean);

        const found = candidates.some((code) => barcodesInImport.has(code));

        if (!found) {
          const mainBarcode = product?.barcode ? normalize(product.barcode) : null;

          listResult.missingInImport.push({
            barcode: mainBarcode || "—",
            name: product.name,
            price: product.currentPrice,
            previousTagDate: lastTagDate || null,
          });
        }
      }

      /**
       * Logs
       */
      await PriceUploadLog.create({
        uploadedBy: req.user?._id || null,
        listId: list._id,
        listName: list.name,
        fileName: `Importación ID: ${importId}`,
        createdAt: now,
        priceIncreased: listResult.priceIncreased,
        priceDecreased: listResult.priceDecreased,
        priceUnchanged: listResult.priceUnchanged,
        firstTimeSet: listResult.firstTimeSet,
        missingInExcel: listResult.missingInImport,
        notInAnyList: [],
        stockUpdated: listResult.stockUpdated,
      });

      resultByList.push(listResult);

      /**
       * Marcar lastTagDate sólo para productos que se re-etiquetan
       */
      const productosParaEtiquetar = [
        ...listResult.priceIncreased,
        ...listResult.priceDecreased,
        ...listResult.firstTimeSet,
      ];

      await Promise.all(
        productosParaEtiquetar.map((prod) =>
          ProductList.updateOne(
            {
              _id: list._id,
              "products.product": prod._id,
            },
            {
              $set: {
                "products.$.lastTagDate": now,
              },
            }
          )
        )
      );
    }

    /**
     * 12) notInAnyList:
     *     si el import trae códigos que no están en ninguna lista
     */
    const allBarcodesInLists = new Set(
      selectedLists.flatMap((l) =>
        l.products.flatMap((p) => {
          const prod = p.product;

          const main = prod?.barcode ? normalize(prod.barcode) : null;
          const alts = (prod?.alternateBarcodes || []).map((b) => normalize(b));

          return [main, ...alts].filter(Boolean);
        })
      )
    );

    for (const row of consolidatedRows) {
      const bc = row?.barcode ? normalize(row.barcode) : null;
      if (!bc) continue;

      if (!allBarcodesInLists.has(bc)) {
        notInAnyList.push({ barcode: bc, price: row.price });
      }
    }

    stockImport.status = "applied";
    await stockImport.save();

    return res.json({
      message: "Precios y stock actualizados desde la importación",
      lists: resultByList,
      notInAnyList,
    });
  } catch (error) {
    console.error("❌ Error al actualizar desde importación:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};







// controllers/productList/updateFromStockImport.js
export const updateFromImport = async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: "Falta el parámetro branchId" });
    }

    const latest = await StockImport.findOne({
      branch: branchId,
      // status: "applied",
    })
      .sort({ importedAt: -1 })
      .select("_id branch importedAt");

    if (!latest) {
      return res.status(404).json({
        message:
          "No se encontró ninguna importación aplicada para esta sucursal",
      });
    }

    res.json(latest);
  } catch (error) {
    console.error("❌ Error al obtener importación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


export const applyImportToBarcodes = async (req, res) => {
  try {
    const { importId, barcodes } = req.body;
    console.log("importId, barcodes", importId, barcodes);
    if (!importId || !Array.isArray(barcodes) || barcodes.length === 0) {
      return res
        .status(400)
        .json({ message: "Faltan datos: importId y barcodes" });
    }

    const stockImport = await StockImport.findById(importId);
    if (!stockImport) {
      return res.status(404).json({ message: "Importación no encontrada" });
    }

    const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    // --- 0) Expandir el set de códigos para incluir códigos relacionados
    // (si el front envió 1065400082 y en productos está como principal o alternativo)
    const allBarcodes = new Set(barcodes.map((b) => String(b).trim()));

    // buscar productos relacionados para agregar sus códigos al set
    const relatedProducts = await Product.find({
      $or: [
        { barcode: { $in: barcodes } },
        { barcodes: { $in: barcodes } },
        { alternateCodes: { $in: barcodes } },
        { alternateBarcodes: { $in: barcodes } }, // por si usás cualquiera de estos nombres
      ],
    }).lean();

    for (const p of relatedProducts) {
  if (p.barcode) allBarcodes.add(String(p.barcode).trim());

  if (Array.isArray(p.barcodes))
    p.barcodes.forEach(c => allBarcodes.add(String(c).trim()));

  if (Array.isArray(p.alternateCodes))
    p.alternateCodes.forEach(c => allBarcodes.add(String(c).trim()));

  if (Array.isArray(p.alternateBarcodes))
    p.alternateBarcodes.forEach(c => allBarcodes.add(String(c).trim()));
}


    // --- 1) Construir rowsMap usando allBarcodes (no solo barcodes entrantes)
    const rowsMap = new Map();
    for (const row of stockImport.rows) {
      const rowBarcode = row.barcode?.toString().trim();
      if (!rowBarcode) continue;
      if (allBarcodes.has(rowBarcode)) {
        const key = rowBarcode;
        const prev = rowsMap.get(key) || [];
        rowsMap.set(key, [...prev, row]);
      }
    }

    // --- 2) Seleccionar finalRows (tu lógica existente)
    const finalRows = [];
    for (const [barcode, rows] of rowsMap.entries()) {
      const valid = rows.filter(
        (r) =>
          !isNaN(Number(r.price)) && r.price !== null && r.price !== undefined
      );
      if (valid.length === 0) continue;

      const best =
        valid
          .filter((r) => typeof r.stock === "number" && r.stock > 0)
          .sort((a, b) => b.stock - a.stock)[0] || valid[0];

      finalRows.push(best);
    }

    if (finalRows.length === 0) {
      return res.json({
        message: "No hay filas válidas para actualizar (finalRows vacío)",
        updated: 0,
        rows: [],
      });
    }

    // --- 3) Cargar products (por barcode principal o alternativos)
    const products = await Product.find({
      $or: [
        { barcode: { $in: Array.from(allBarcodes) } },
        { barcodes: { $in: Array.from(allBarcodes) } },
        { alternateCodes: { $in: Array.from(allBarcodes) } },
        { alternateBarcodes: { $in: Array.from(allBarcodes) } },
      ],
    }).populate("priceHistory");

    // construir mapa que resuelva cualquier código (principal o alternativo) -> product
    const productsMap = new Map();
    for (const p of products) {
      if (p.barcode) productsMap.set(String(p.barcode).trim(), p);
      if (Array.isArray(p.barcodes))
        for (const c of p.barcodes) if (c) productsMap.set(String(c).trim(), p);
      if (Array.isArray(p.alternateCodes))
        for (const c of p.alternateCodes)
          if (c) productsMap.set(String(c).trim(), p);
      if (Array.isArray(p.alternateBarcodes))
        for (const c of p.alternateBarcodes)
          if (c) productsMap.set(String(c).trim(), p);
    }

    // --- 4) Stocks actuales para branch (usar products encontrados)
    const existingStocks = await Stock.find({
      branch: stockImport.branch,
      product: { $in: products.map((p) => p._id) },
    });
    const stockMap = new Map(
      existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
    );

    // --- 5) Preparar bulk ops
    const bulkProductUpdates = [];
    const bulkStockOps = [];
    const priceHistories = [];
    const updatedRowsForResponse = []; // rows que realmente actualizamos (para retornar al front)
    const seenStockKeys = new Set();

    for (const row of finalRows) {
      const rowBarcode = String(row.barcode).trim();
      const product = productsMap.get(rowBarcode);
      if (!product) {
        // si no se encontró por el código del row, intentamos buscar por relacion con codigo principal
        // (ej: rowBarcode es alternativo y en productsMap existe mapeado)
        continue;
      }

      const newPrice = Number(row.price);
      if (isNaN(newPrice)) continue;

      const oldPrice = product.currentPrice ?? 0;

      if (oldPrice !== newPrice) {
        priceHistories.push({
          productId: product._id,
          price: newPrice,
          date: now,
        });
      }

      // safe name: no sobreescribimos si el import trae "Sin nombre"
      const safeName =
        row.name && String(row.name).trim().toLowerCase() !== "sin nombre"
          ? String(row.name).trim()
          : product.name;

      // actualizar alternate arrays: si el row tiene barcodes (array de alternativos) los usamos
      const newAlternateArr =
        Array.isArray(row.barcodes) && row.barcodes.length > 0
          ? row.barcodes.map((x) => String(x).trim())
          : product.alternateCodes || product.alternateBarcodes || [];

      bulkProductUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              currentPrice: newPrice,
              cost: row.cost ?? product.cost,
              name: safeName,
              category: row.category || product.category,
              lab: row.lab || product.lab,
              // alternateCodes: newAlternateArr,
              alternateBarcodes: newAlternateArr,


            },
          },
        },
      });

      // preparar respuesta - usamos el price del import (row.price)
      updatedRowsForResponse.push({
        barcode: rowBarcode,
        price: newPrice,
        stock: typeof row.stock === "number" ? row.stock : null,
        name: safeName,
        productId: product._id,
      });

      // stock ops
      const stockKey = `${product._id}_${stockImport.branch}`;
      const quantity = typeof row.stock === "number" ? row.stock : 0;

      if (stockMap.has(stockKey)) {
        bulkStockOps.push({
          updateOne: {
            filter: { _id: stockMap.get(stockKey)._id },
            update: {
              $set: {
                quantity,
                lastUpdated: now,
              },
            },
          },
        });
      } else if (!seenStockKeys.has(stockKey)) {
        seenStockKeys.add(stockKey);
        bulkStockOps.push({
          insertOne: {
            document: {
              product: product._id,
              branch: stockImport.branch,
              quantity,
              lastUpdated: now,
            },
          },
        });
      }
    }

    // Ejecutar bulk updates si hay
    if (bulkProductUpdates.length > 0) {
      await Product.bulkWrite(bulkProductUpdates);
    }

    if (bulkStockOps.length > 0) {
      await Stock.bulkWrite(bulkStockOps);
    }

    if (priceHistories.length > 0) {
      const inserted = await PriceHistory.insertMany(priceHistories);
      const updatesByProduct = new Map();
      for (const h of inserted) {
        if (!updatesByProduct.has(h.productId)) {
          updatesByProduct.set(h.productId, []);
        }
        updatesByProduct.get(h.productId).push(h._id);
      }

      for (const [productId, historyIds] of updatesByProduct.entries()) {
        await Product.findByIdAndUpdate(productId, {
          $push: { priceHistory: { $each: historyIds } },
        });
      }
    }

    // --- 6) Marcar import como aplicada
await StockImport.findByIdAndUpdate(importId, {
  $set: { status: "applied", appliedAt: now },
});

// --- 7) Cleanup: dejar solo las últimas 2 imports applied por sucursal
// --- 7) Cleanup: dejar solo las últimas 2 imports applied por sucursal

const keep = await StockImport.find({
  branch: stockImport.branch,
  status: "applied",
})
  .sort({ appliedAt: -1 })
  .limit(2)
  .select("_id")
  .lean();

const keepIds = keep.map((x) => x._id);

console.log(
  `📦 Imports applied branch=${stockImport.branch}: mantengo ${keepIds.length}`,
  keepIds
);

const deleteResult = await StockImport.deleteMany({
  branch: stockImport.branch,
  status: "applied",
  _id: { $nin: keepIds },
});

console.log(
  `🧹 Cleanup applied imports: deletedCount=${deleteResult.deletedCount}`
);

// --- 8) Cleanup: PENDING -> dejar solo la más nueva
const keepPending = await StockImport.find({
  branch: stockImport.branch,
  status: "pending",
})
  .sort({ importedAt: -1 })
  .limit(1)
  .select("_id")
  .lean();

const keepPendingIds = keepPending.map((x) => x._id);

const deletePending = await StockImport.deleteMany({
  branch: stockImport.branch,
  status: "pending",
  _id: { $nin: keepPendingIds },
});

console.log(
  `🧹 Cleanup PENDING: mantengo=${keepPendingIds.length} borradas=${deletePending.deletedCount}`
);

    // Devolver rows según lo que acabamos de aplicar (precio tomado del import)
    return res.json({
      message: "Productos actualizados correctamente desde la importación",
      updated: updatedRowsForResponse.length,
      rows: updatedRowsForResponse,
    });
  } catch (error) {
    console.error("❌ Error al aplicar importación por códigos:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
