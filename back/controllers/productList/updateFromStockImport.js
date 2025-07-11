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
//       return res.status(400).json({ message: "Faltan datos requeridos: importId y listIds" });
//     }

//     const stockImport = await StockImport.findById(importId);
//     if (!stockImport) {
//       return res.status(404).json({ message: "Importación no encontrada" });
//     }

//     const { branch, rows: importedProducts } = stockImport;
//     const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     const selectedLists = await ProductList.find({ _id: { $in: listIds } }).populate("products.product");

//     const barcodesFromImport = importedProducts.map(p => p.barcode?.trim()).filter(Boolean);
//     const resultByList = [];
//     const notInAnyList = [];

//     for (const list of selectedLists) {
//       const mapListProducts = new Map();
//       for (const item of list.products) {
//         if (item.product?.barcode) {
//           mapListProducts.set(item.product.barcode.trim(), {
//             product: item.product,
//             lastTagDate: item.lastTagDate,
//           });
//         }
//       }

//       const changes = {
//         listId: list._id,
//         listName: list.name,
//         priceIncreased: [],
//         priceDecreased: [],
//         priceUnchanged: [],
//         firstTimeSet: [],
//         missingInImport: [],
//         stockUpdated: [],
//       };

//       const updateTasks = [];

//       for (const { barcode, price, stock } of importedProducts) {
//         if (!barcode || typeof price !== "number") continue;

//         updateTasks.push(async () => {
//           const cleanBarcode = barcode.trim();
//           const entry = mapListProducts.get(cleanBarcode);
//           if (!entry || !entry.product) return;

//           const { product, lastTagDate } = entry;
//           const fullProduct = await Product.findById(product._id).populate("priceHistory");

//           const hasHistory = fullProduct.priceHistory?.length > 0;
//           const isFirstTag = !lastTagDate;

//           if (!hasHistory || isFirstTag) {
//             await Product.findByIdAndUpdate(fullProduct._id, { currentPrice: price });

//             const history = await PriceHistory.create({
//               productId: fullProduct._id,
//               price,
//               date: now,
//             });

//             await Product.findByIdAndUpdate(fullProduct._id, {
//               $push: { priceHistory: history._id },
//             });

//             changes.firstTimeSet.push({
//               _id: fullProduct._id,
//               barcode: cleanBarcode,
//               name: fullProduct.name,
//               newPrice: price,
//               lastTagDate: now,
//             });
//           } else {
//             const lastEntry = [...fullProduct.priceHistory].sort(
//               (a, b) => new Date(b.date) - new Date(a.date)
//             )[0];
//             const oldPrice = lastEntry?.price ?? 0;

//             if (price === oldPrice) {
//               changes.priceUnchanged.push({
//                 _id: fullProduct._id,
//                 barcode: cleanBarcode,
//                 name: fullProduct.name,
//                 price,
//                 stock,
//               });
//             } else {
//               await Product.findByIdAndUpdate(fullProduct._id, { currentPrice: price });

//               const history = await PriceHistory.create({
//                 productId: fullProduct._id,
//                 price,
//                 date: now,
//               });

//               await Product.findByIdAndUpdate(fullProduct._id, {
//                 $push: { priceHistory: history._id },
//               });

//               const priceChange = {
//                 _id: fullProduct._id,
//                 barcode: cleanBarcode,
//                 name: fullProduct.name,
//                 oldPrice,
//                 newPrice: price,
//                 lastTagDate: now,
//                 stock,
//               };

//               if (price > oldPrice) changes.priceIncreased.push(priceChange);
//               else changes.priceDecreased.push(priceChange);
//             }
//           }

//           // Actualizar stock por sucursal
//           if (branch && typeof stock === "number") {
//             await Stock.findOneAndUpdate(
//               { product: fullProduct._id, branch },
//               { $set: { quantity: stock, lastUpdated: now } },
//               { upsert: true }
//             );

//             changes.stockUpdated.push({
//               _id: fullProduct._id,
//               barcode: cleanBarcode,
//               name: fullProduct.name,
//               stock,
//             });
//           }
//         });
//       }

//       await runBatches(updateTasks, 20);

//       const toTag = [
//         ...changes.priceIncreased,
//         ...changes.priceDecreased,
//         ...changes.firstTimeSet,
//       ];

//       for (const p of toTag) {
//         await ProductList.updateOne(
//           { _id: list._id, "products.product": p._id },
//           { $set: { "products.$.lastTagDate": now } }
//         );
//       }

//       // Productos que estaban en la lista pero no vinieron en la importación
//       for (const item of list.products) {
//         const b = item.product?.barcode?.trim();
//         if (b && !barcodesFromImport.includes(b)) {
//           changes.missingInImport.push({
//             barcode: b,
//             name: item.product.name,
//             price: item.product.currentPrice,
//             lastTagDate: item.lastTagDate ?? null,
//           });
//         }
//       }

//       resultByList.push(changes);
//     }

//     // Productos de la importación que no están en ninguna lista
//     const barcodesInLists = new Set(
//       selectedLists.flatMap((l) => l.products.map((i) => i.product?.barcode?.trim()))
//     );

//     for (const { barcode, price } of importedProducts) {
//       const cleanBarcode = barcode?.trim();
//       if (!barcodesInLists.has(cleanBarcode)) {
//         notInAnyList.push({ barcode: cleanBarcode, price });
//       }
//     }

//     for (const listResult of resultByList) {
//       await PriceUploadLog.create({
//         uploadedBy: req.user?._id || null,
//         listId: listResult.listId,
//         listName: listResult.listName,
//         fileName: `Importación ID: ${importId}`,
//         createdAt: now,
//         priceIncreased: listResult.priceIncreased,
//         priceDecreased: listResult.priceDecreased,
//         priceUnchanged: listResult.priceUnchanged,
//         firstTimeSet: listResult.firstTimeSet,
//         missingInExcel: listResult.missingInImport,
//         notInAnyList,
//         stockUpdated: listResult.stockUpdated,
//       });
//     }

//     res.json({
//       message: `Precios y stock actualizados desde la importación`,
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

    const { branch, rows: importedRows } = stockImport;
    const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    const barcodes = importedRows.map((r) => r.barcode?.trim()).filter(Boolean);
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

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    const bulkProductUpdates = [];
    const bulkProductInserts = [];
    const bulkStockOps = [];
    const seenInsertStockKeys = new Set();
    const priceHistories = [];

    const resultByList = [];
    const notInAnyList = [];

    // Crear mapa de listas por barcode
    const listMap = new Map();
    for (const list of selectedLists) {
      for (const item of list.products) {
        if (item.product?.barcode) {
          const barcode = item.product.barcode.trim();
          if (!listMap.has(barcode)) listMap.set(barcode, []);
          listMap.get(barcode).push({ list, item });
        }
      }
    }

    // Procesar filas importadas: actualizar/inserción productos y stocks
    for (const row of importedRows) {
      const barcode = row.barcode?.trim();
      if (!barcode || typeof row.price !== "number") continue;

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

        const update = {
          name: row.name || product.name,
          currentPrice: newPrice,
          cost: row.cost,
          category: row.category || product.category,
          lab: row.lab || product.lab,
          barcodes: row.barcodes || product.barcodes,
        };

        bulkProductUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: update },
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
        // Crear nuevo producto
        const newProduct = {
          barcode,
          name: row.name,
          currentPrice: row.price,
          cost: row.cost,
          category: row.category,
          lab: row.lab,
          barcodes: row.barcodes || [],
        };
        bulkProductInserts.push(newProduct);
      }
    }

    // Insertar nuevos productos
    if (bulkProductInserts.length > 0) {
      const inserted = await Product.insertMany(bulkProductInserts);
      inserted.forEach((p) => productsMap.set(p.barcode.trim(), p));
    }

    // Ejecutar actualizaciones bulk
    if (bulkProductUpdates.length > 0)
      await Product.bulkWrite(bulkProductUpdates);
    if (bulkStockOps.length > 0) await Stock.bulkWrite(bulkStockOps);

    // Insertar historial de precios
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

    // Generar logs y resultados por lista
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

        const imported = importedRows.find(
          (r) => r.barcode?.trim() === barcode
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
          });
        } else if (newPrice > oldPrice) {
          listResult.priceIncreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
          });
        } else if (newPrice < oldPrice) {
          listResult.priceDecreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
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

      // Actualizar lastTagDate en productos que cambiaron precio o son primera vez
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

    // Productos en importación que no están en ninguna lista
    const allBarcodesInLists = new Set(
      selectedLists.flatMap((l) =>
        l.products.map((p) => p.product?.barcode?.trim())
      )
    );

    for (const row of importedRows) {
      const barcode = row.barcode?.trim();
      if (barcode && !allBarcodesInLists.has(barcode)) {
        notInAnyList.push({ barcode, price: row.price });
      }
    }

    // Marcar importación como aplicada
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

