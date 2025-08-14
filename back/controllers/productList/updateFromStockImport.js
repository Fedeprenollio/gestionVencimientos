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
            lastTagDate: now,
          });
        } else if (newPrice > oldPrice) {
          listResult.priceIncreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
            lastTagDate: now,
          });
        } else if (newPrice < oldPrice) {
          listResult.priceDecreased.push({
            _id: product._id,
            barcode,
            name: product.name,
            oldPrice,
            newPrice,
            lastTagDate: now,
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

    const rowsMap = new Map();
    for (const row of stockImport.rows) {
      if (row.barcode && barcodes.includes(row.barcode.trim())) {
        const key = row.barcode.trim();
        const prev = rowsMap.get(key) || [];
        rowsMap.set(key, [...prev, row]);
      }
    }

    const finalRows = [];
    for (const [barcode, rows] of rowsMap.entries()) {
      const valid = rows.filter((r) => typeof r.price === "number");
      if (valid.length === 0) continue;

      // Elegimos el que tenga mayor stock positivo, si no, el primero
      const best =
        valid
          .filter((r) => typeof r.stock === "number" && r.stock > 0)
          .sort((a, b) => b.stock - a.stock)[0] || valid[0];

      finalRows.push(best);
    }

    const products = await Product.find({ barcode: { $in: barcodes } });
    const productsMap = new Map(products.map((p) => [p.barcode.trim(), p]));

    const existingStocks = await Stock.find({
      branch: stockImport.branch,
      product: { $in: products.map((p) => p._id) },
    });
    const stockMap = new Map(
      existingStocks.map((s) => [`${s.product}_${s.branch}`, s])
    );

    const bulkProductUpdates = [];
    const bulkStockOps = [];
    const priceHistories = [];
    const seenStockKeys = new Set();

    for (const row of finalRows) {
      const barcode = row.barcode.trim();
      const product = productsMap.get(barcode);
      if (!product || typeof row.price !== "number") continue;

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
              currentPrice: newPrice,
              cost: row.cost,
              name: row.name || product.name,
              category: row.category || product.category,
              lab: row.lab || product.lab,
              barcodes: row.barcodes || product.barcodes,
            },
          },
        },
      });

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

    res.json({
      message: "Productos actualizados correctamente desde la importación",
      updated: finalRows.length,
      rows: finalRows.map((row) => ({
        barcode: row.barcode,
        price: row.price,
        stock: row.stock ?? null,
        name: row.name,
      })),
    });
  } catch (error) {
    console.error("❌ Error al aplicar importación por códigos:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

