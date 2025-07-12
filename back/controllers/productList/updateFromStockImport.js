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

//     const filteredRows = stockImport.rows.filter(
//       (row) => row.barcode && barcodesInLists.has(row.barcode.trim())
//     );

//     const { branch } = stockImport;
//     const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     const barcodes = [...barcodesInLists];
//     const fullProducts = await Product.find({
//       barcode: { $in: barcodes },
//     }).populate("priceHistory");

//     const productsMap = new Map();
//     for (const p of fullProducts) {
//       const lastEntry = [...(p.priceHistory || [])].sort(
//         (a, b) => new Date(b.date) - new Date(a.date)
//       )[0];
//       const oldPrice = lastEntry?.price ?? 0;
//       productsMap.set(p.barcode.trim(), { product: p, oldPrice });
//     }

//     const existingStocks = await Stock.find({
//       branch,
//       product: fullProducts.map((p) => p._id),
//     });
//     const stockMap = new Map(
//       existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
//     );

//     const bulkProductUpdates = [];
//     const bulkProductInserts = [];
//     const bulkStockOps = [];
//     const seenInsertStockKeys = new Set();
//     const priceHistories = [];

//     const resultByList = [];
//     const notInAnyList = [];

//     const listMap = new Map();
//     for (const list of selectedLists) {
//       for (const item of list.products) {
//         if (item.product?.barcode) {
//           const barcode = item.product.barcode.trim();
//           if (!listMap.has(barcode)) listMap.set(barcode, []);
//           listMap.get(barcode).push({ list, item });
//         }
//       }
//     }

//     for (const row of filteredRows) {
//       const barcode = row.barcode.trim();
//       if (typeof row.price !== "number") continue;

//       const entry = productsMap.get(barcode);

//       if (entry) {
//         const { product, oldPrice } = entry;
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
//       inserted.forEach((p) =>
//         productsMap.set(p.barcode.trim(), { product: p, oldPrice: 0 })
//       );
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

//       const barcodesInImport = new Set(
//         filteredRows.map((r) => r.barcode.trim())
//       );

//       for (const { product, lastTagDate } of list.products) {
//         const barcode = product?.barcode?.trim();
//         if (!barcode || !productsMap.has(barcode)) continue;

//         const imported = filteredRows.find((r) => r.barcode.trim() === barcode);
//         if (!imported || typeof imported.price !== "number") continue;

//         const { oldPrice } = productsMap.get(barcode);
//         const newPrice = imported.price;

//         const isFirst = !lastTagDate;
//         if (isFirst) {
//           listResult.firstTimeSet.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             newPrice,
//              lastTagDate: now,
//           });
//         } else if (newPrice > oldPrice) {
//           listResult.priceIncreased.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//              lastTagDate: now,
//           });
//         } else if (newPrice < oldPrice) {
//           listResult.priceDecreased.push({
//             _id: product._id,
//             barcode,
//             name: product.name,
//             oldPrice,
//             newPrice,
//              lastTagDate: now,
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
//             { _id: list._id, "products.product": prod._id },
//             { $set: { "products.$.lastTagDate": now } }
//           )
//         )
//       );
//     }

//     const allBarcodesInListsSet = new Set(
//       selectedLists.flatMap((l) =>
//         l.products.map((p) => p.product?.barcode?.trim())
//       )
//     );

//     for (const row of filteredRows) {
//       const barcode = row.barcode?.trim();
//       if (barcode && !allBarcodesInListsSet.has(barcode)) {
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

export const updateFromStockImport = async (req, res) => {
  try {
    const { importId, listIds } = req.body;
    if (!importId || !listIds || !Array.isArray(listIds)) {
      return res
        .status(400)
        .json({ message: "Faltan datos requeridos: importId y listIds" });
    }

    const stockImport = await StockImport.findById(importId);
    if (!stockImport)
      return res.status(404).json({ message: "Importación no encontrada" });

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    const barcodesInLists = new Set(
      selectedLists.flatMap((list) =>
        list.products
          .map((item) => item.product?.barcode?.trim())
          .filter(Boolean)
      )
    );

    const relevantRows = stockImport.rows.filter(
      (row) => row.barcode && barcodesInLists.has(row.barcode.trim())
    );

    // Agrupar por código de barras
    const groupedRowsMap = new Map();
    for (const row of relevantRows) {
      const barcode = row.barcode?.trim();
      if (!barcode) continue;

      if (!groupedRowsMap.has(barcode)) {
        groupedRowsMap.set(barcode, {
          totalStock: row.stock ?? 0,
          bestRow: row.stock > 0 ? row : null,
          fallbackRow: row,
        });
      } else {
        const existing = groupedRowsMap.get(barcode);
        const totalStock = (existing.totalStock ?? 0) + (row.stock ?? 0);
        const bestRow =
          row.stock > 0 &&
          (!existing.bestRow || row.stock > existing.bestRow.stock)
            ? row
            : existing.bestRow;

        groupedRowsMap.set(barcode, {
          totalStock,
          bestRow,
          fallbackRow: existing.fallbackRow,
        });
      }
    }

    // Reconstruir filas con datos consolidados
    const consolidatedRows = [];
    for (const [
      barcode,
      { totalStock, bestRow, fallbackRow },
    ] of groupedRowsMap.entries()) {
      const sourceRow = bestRow || fallbackRow;
      consolidatedRows.push({
        barcode,
        name: sourceRow.name ?? "",
        price: sourceRow.price ?? 0,
        cost: sourceRow.cost ?? 0,
        category: sourceRow.category ?? "",
        lab: sourceRow.lab ?? "",
        barcodes: sourceRow.barcodes ?? [],
        stock: totalStock,
      });
    }

    const { branch } = stockImport;
    const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    const barcodes = consolidatedRows.map((r) => r.barcode);
    const products = await Product.find({
      barcode: { $in: barcodes },
    }).populate("priceHistory");
    const productsMap = new Map(products.map((p) => [p.barcode.trim(), p]));

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

    for (const row of consolidatedRows) {
      const barcode = row.barcode.trim();
      if (typeof row.price !== "number") continue;

      let product = productsMap.get(barcode);

      if (product) {
        const oldPrice = product.currentPrice ?? 0;
        const newPrice = row.price;

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
                barcodes: row.barcodes || product.barcodes,
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
        bulkProductInserts.push({
          barcode,
          name: row.name,
          currentPrice: row.price,
          cost: row.cost,
          category: row.category,
          lab: row.lab,
          barcodes: row.barcodes || [],
        });
      }
    }

    if (bulkProductInserts.length > 0) {
      const inserted = await Product.insertMany(bulkProductInserts);
      inserted.forEach((p) => productsMap.set(p.barcode.trim(), p));
    }

    if (bulkProductUpdates.length > 0)
      await Product.bulkWrite(bulkProductUpdates);
    if (bulkStockOps.length > 0) await Stock.bulkWrite(bulkStockOps);

    if (priceHistories.length > 0) {
      const insertedHistories = await PriceHistory.insertMany(priceHistories);
      const updatesByProduct = new Map();
      for (const h of insertedHistories) {
        if (!updatesByProduct.has(h.productId))
          updatesByProduct.set(h.productId, []);
        updatesByProduct.get(h.productId).push(h._id);
      }

      for (const [productId, historyIds] of updatesByProduct.entries()) {
        await Product.findByIdAndUpdate(productId, {
          $push: { priceHistory: { $each: historyIds } },
        });
      }
    }

    const resultByList = [];
    const notInAnyList = [];

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

      const barcodesInImport = new Set(barcodes);

      for (const { product, lastTagDate } of list.products) {
        const barcode = product?.barcode?.trim();
        if (!barcode || !productsMap.has(barcode)) continue;

        const imported = consolidatedRows.find(
          (r) => r.barcode.trim() === barcode
        );
        if (!imported || typeof imported.price !== "number") continue;

        const current = productsMap.get(barcode);
        const oldPrice = product.currentPrice ?? 0;
        const newPrice = imported.price;

        const isFirst = !lastTagDate;
        if (isFirst) {
          listResult.firstTimeSet.push({
            _id: product._id,
            barcode,
            name: product.name,
            newPrice,
            lastTagDate: now
          });
        } else if (newPrice > oldPrice) {
          listResult.priceIncreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
            lastTagDate: now
          });
        } else if (newPrice < oldPrice) {
          listResult.priceDecreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
            lastTagDate: now
          });
        } else {
          listResult.priceUnchanged.push({
            _id: product._id,
            barcode,
            name: product.name,
            price: newPrice,
          });
        }

        listResult.stockUpdated.push({
          _id: product._id,
          barcode,
          name: product.name,
          stock: imported.stock,
        });
      }

      for (const { product } of list.products) {
        const barcode = product?.barcode?.trim();
        if (barcode && !barcodesInImport.has(barcode)) {
          listResult.missingInImport.push({
            barcode,
            name: product.name,
            price: product.currentPrice,
            lastTagDate: product.lastTagDate ?? null,
          });
        }
      }

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

    const allBarcodesInLists = new Set(
      selectedLists.flatMap((l) =>
        l.products.map((p) => p.product?.barcode?.trim())
      )
    );

    for (const row of consolidatedRows) {
      const barcode = row.barcode?.trim();
      if (barcode && !allBarcodesInLists.has(barcode)) {
        notInAnyList.push({ barcode, price: row.price });
      }
    }

    stockImport.status = "applied";
    await stockImport.save();

    res.json({
      message: "Precios y stock actualizados desde la importación",
      lists: resultByList,
      notInAnyList,
    });
  } catch (error) {
    console.error("❌ Error al actualizar desde importación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
