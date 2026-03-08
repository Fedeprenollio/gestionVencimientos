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
//     const { importId, listIds, branchId } = req.body;

//     if (!branchId) {
//       return res.status(400).json({ message: "Falta branchId" });
//     }

//     const normalize = (v) => (v ? String(v).trim() : null);

//     const stockImport = await StockImport.findById(importId).populate(
//       "branch",
//       "name",
//     );

//     if (!stockImport) {
//       return res.status(404).json({ message: "Importación no encontrada" });
//     }

//     if (String(stockImport.branch?._id) !== String(branchId)) {
//       return res.status(400).json({
//         message: `El importId pertenece a otra sucursal: ${stockImport.branch?.name}`,
//       });
//     }

//     const selectedLists = await ProductList.find({
//       _id: { $in: listIds },
//     }).populate("products.product");

//     const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

//     /**
//      * ============================================================
//      * 1) FALLBACK IMPORTS
//      * ============================================================
//      */

//     const lastImportsAgg = await StockImport.aggregate([
//       { $match: { status: "applied" } },
//       { $sort: { importedAt: -1 } },
//       {
//         $group: {
//           _id: "$branch",
//           importId: { $first: "$_id" },
//           importedAt: { $first: "$importedAt" },
//         },
//       },
//     ]);

//     const fallbackImportIds = lastImportsAgg
//       .filter((x) => String(x._id) !== String(stockImport.branch?._id))
//       .map((x) => x.importId);

//     const fallbackImports = await StockImport.find({
//       _id: { $in: fallbackImportIds },
//     })
//       .populate("branch", "name")
//       .lean();

//     const fallbackRowMap = new Map();

//     for (const imp of fallbackImports) {
//       for (const row of imp.rows || []) {
//         const bc = normalize(row.barcode);
//         if (!bc) continue;

//         const existing = fallbackRowMap.get(bc);

//         if (!existing || new Date(imp.importedAt) > new Date(existing.importedAt)) {
//           fallbackRowMap.set(bc, {
//             row,
//             branchName: imp.branch?.name || "Sucursal",
//             importId: imp._id,
//             importedAt: imp.importedAt,
//           });
//         }
//       }
//     }

//     /**
//      * ============================================================
//      * 2) BARCODE SET DE LISTAS
//      * ============================================================
//      */

//     const barcodesInLists = new Set(
//       selectedLists.flatMap((list) =>
//         list.products.flatMap((item) => {
//           const p = item.product;

//           const main = normalize(p?.barcode);
//           const alts = (p?.alternateBarcodes || []).map(normalize);

//           return [main, ...alts].filter(Boolean);
//         }),
//       ),
//     );

//     /**
//      * ============================================================
//      * 3) FILTRAR ROWS RELEVANTES
//      * ============================================================
//      */

//     const relevantRows = stockImport.rows.filter((row) => {
//       const bc = normalize(row?.barcode);
//       return bc && barcodesInLists.has(bc);
//     });

//     /**
//      * ============================================================
//      * 4) AGRUPAR ROWS
//      * ============================================================
//      */

//     const groupedRowsMap = new Map();

//     for (const row of relevantRows) {
//       const barcode = normalize(row.barcode);
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

//         const totalStock = existing.totalStock + stock;

//         const bestRow =
//           stock > 0 &&
//           (!existing.bestRow || existing.bestRow.stock < stock)
//             ? row
//             : existing.bestRow;

//         groupedRowsMap.set(barcode, {
//           totalStock,
//           bestRow,
//           fallbackRow: existing.fallbackRow,
//         });
//       }
//     }

//     const consolidatedRows = [];

//     for (const [barcode, data] of groupedRowsMap.entries()) {
//       const sourceRow = data.bestRow || data.fallbackRow;

//       consolidatedRows.push({
//         barcode,
//         name: sourceRow.name ?? "",
//         price: Number(sourceRow.price) ?? 0,
//         stock: data.totalStock ?? 0,
//       });
//     }

//     /**
//      * ============================================================
//      * 5) PRODUCTOS
//      * ============================================================
//      */

//     const importBarcodes = consolidatedRows.map((r) => r.barcode);

//     const products = await Product.find({
//       $or: [
//         { barcode: { $in: importBarcodes } },
//         { alternateBarcodes: { $in: importBarcodes } },
//       ],
//     });

//     const productsMap = new Map();

//     for (const p of products) {
//       if (p.barcode) productsMap.set(normalize(p.barcode), p);

//       for (const alt of p.alternateBarcodes || []) {
//         productsMap.set(normalize(alt), p);
//       }
//     }

//     const updatedProducts = new Set();

//     /**
//      * ============================================================
//      * 6) RESULTADOS POR LISTA
//      * ============================================================
//      */

//     const resultByList = [];
//     const notInAnyList = [];

//     const findImportRowForProduct = (product) => {
//       const candidates = [
//         normalize(product.barcode),
//         ...(product.alternateBarcodes || []).map(normalize),
//       ].filter(Boolean);

//       for (const code of candidates) {
//         const row = consolidatedRows.find((r) => r.barcode === code);
//         if (row) {
//           return {
//             row,
//             source: "own",
//             branchName: stockImport.branch?.name,
//             importId: stockImport._id,
//             importedAt: stockImport.importedAt,
//           };
//         }
//       }

//       for (const code of candidates) {
//         const fallback = fallbackRowMap.get(code);
//         if (fallback?.row) {
//           return {
//             row: fallback.row,
//             source: "fallback",
//             branchName: fallback.branchName,
//             importId: fallback.importId,
//             importedAt: fallback.importedAt,
//           };
//         }
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

//         const importRow = imported.row;

//         const newPrice = Number(importRow.price);
//         const oldPrice = product.currentPrice ?? 0;

//         if (
//           newPrice !== oldPrice &&
//           !updatedProducts.has(product._id.toString())
//         ) {
//           updatedProducts.add(product._id.toString());

//           await Product.updateOne(
//             { _id: product._id },
//             { $set: { currentPrice: newPrice } },
//           );

//           const history = await PriceHistory.create({
//             productId: product._id,
//             price: newPrice,
//             date: now,
//             operator:
//               imported.source === "fallback" ? "fallback-import" : "import",
//           });

//           await Product.updateOne(
//             { _id: product._id },
//             { $push: { priceHistory: history._id } },
//           );

//           product.currentPrice = newPrice;
//         }

//         const isFirst = !lastTagDate;

//         const taggedNow = isFirst || newPrice !== oldPrice;

//         const payload = {
//           _id: product._id,
//           barcode: product.barcode,
//           name: product.name,
//           previousTagDate: lastTagDate || null,
//           taggedNow,
//           taggedAt: taggedNow ? now : null,
//           priceSource: imported.source,
//           sourceBranchName: imported.branchName,
//           sourceImportId: imported.importId,
//           sourceImportDate: imported.importedAt,
//         };

//         if (isFirst) {
//           listResult.firstTimeSet.push({ ...payload, oldPrice, newPrice });
//         } else if (newPrice > oldPrice) {
//           listResult.priceIncreased.push({ ...payload, oldPrice, newPrice });
//         } else if (newPrice < oldPrice) {
//           listResult.priceDecreased.push({ ...payload, oldPrice, newPrice });
//         } else {
//           listResult.priceUnchanged.push({ ...payload, price: newPrice });
//         }

//         listResult.stockUpdated.push({
//           ...payload,
//           stock: importRow.stock ?? 0,
//         });
//       }

//       for (const { product, lastTagDate } of list.products) {

//   const candidates = [
//     normalize(product?.barcode),
//     ...(product?.alternateBarcodes || []).map(normalize),
//   ].filter(Boolean);

//   const foundInOwn = candidates.some((c) => barcodesInImport.has(c));
//   const foundInFallback = candidates.some((c) => barcodesInFallback.has(c));

//   if (!foundInOwn && !foundInFallback) {

//     listResult.missingInImport.push({
//       barcode: product.barcode || "—",
//       name: product.name,
//       price: product.currentPrice,
//       previousTagDate: lastTagDate || null,
//     });

//   }
// }
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
//     }

//     stockImport.status = "applied";
//     await stockImport.save();

//     return res.json({
//       message: "Precios y stock actualizados desde la importación",
//       lists: resultByList,
//     });
//   } catch (error) {
//     console.error("❌ Error al actualizar desde importación:", error);
//     return res.status(500).json({ message: "Error del servidor" });
//   }
// };

export const updateFromStockImport = async (req, res) => {
  try {
    const { importId, listIds, branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({ message: "Falta branchId" });
    }

    const normalize = (v) => (v ? String(v).trim().replace(/^0+/, "") : null);

    const stockImport = await StockImport.findById(importId).populate(
      "branch",
      "name",
    );

    if (!stockImport) {
      return res.status(404).json({ message: "Importación no encontrada" });
    }

    if (String(stockImport.branch?._id) !== String(branchId)) {
      return res.status(400).json({
        message: `El importId pertenece a otra sucursal: ${stockImport.branch?.name}`,
      });
    }

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    const now = dayjs().tz("America/Argentina/Buenos_Aires").toDate();

    /**
     * ============================================================
     * 1) FALLBACK IMPORTS
     * ============================================================
     */

    const lastImportsAgg = await StockImport.aggregate([
      { $match: { status: "applied" } },
      { $sort: { importedAt: -1 } },
      {
        $group: {
          _id: "$branch",
          importId: { $first: "$_id" },
          importedAt: { $first: "$importedAt" },
        },
      },
    ]);

    const fallbackImportIds = lastImportsAgg
      .filter((x) => String(x._id) !== String(stockImport.branch?._id))
      .map((x) => x.importId);

    const fallbackImports = await StockImport.find({
      _id: { $in: fallbackImportIds },
    })
      .populate("branch", "name")
      .lean();

    const fallbackRowMap = new Map();

    for (const imp of fallbackImports) {
      for (const row of imp.rows || []) {
        const bc = normalize(row.barcode);
        if (!bc) continue;

        const existing = fallbackRowMap.get(bc);

        const newDate = row.priceDate || imp.importedAt;
        const existingDate =
          existing?.row?.priceDate || existing?.importedAt || null;

        if (!existing || new Date(newDate) > new Date(existingDate)) {
          fallbackRowMap.set(bc, {
            row,
            branchName: imp.branch?.name || "Sucursal",
            importId: imp._id,
            importedAt: imp.importedAt,
          });
        }
      }
    }

    /**
     * ============================================================
     * 2) BARCODES DE LISTAS
     * ============================================================
     */

    const barcodesInLists = new Set(
      selectedLists.flatMap((list) =>
        list.products.flatMap((item) => {
          const p = item?.product;
          if (!p) return [];

          const main = normalize(p.barcode);
          const alts = (p.alternateBarcodes || []).map(normalize);

          return [main, ...alts].filter(Boolean);
        }),
      ),
    );

    /**
     * ============================================================
     * 3) FILTRAR ROWS RELEVANTES
     * ============================================================
     */

    const relevantRows = stockImport.rows.filter((row) => {
      const bc = normalize(row?.barcode);
      return bc && barcodesInLists.has(bc);
    });

    /**
     * ============================================================
     * 4) AGRUPAR ROWS
     * ============================================================
     */

    const groupedRowsMap = new Map();

    for (const row of relevantRows) {
      const barcode = normalize(row.barcode);
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

        const totalStock = existing.totalStock + stock;

        const bestRow =
          stock > 0 && (!existing.bestRow || existing.bestRow.stock < stock)
            ? row
            : existing.bestRow;

        groupedRowsMap.set(barcode, {
          totalStock,
          bestRow,
          fallbackRow: existing.fallbackRow,
        });
      }
    }

    const consolidatedRows = [];
    const consolidatedMap = new Map();

    for (const [barcode, data] of groupedRowsMap.entries()) {
      const sourceRow = data.bestRow || data.fallbackRow;

      const row = {
        barcode,
        name: sourceRow.name ?? "",
        price: Number(sourceRow.price) ?? 0,
        stock: data.totalStock ?? 0,
      };

      consolidatedRows.push(row);
      consolidatedMap.set(barcode, row);
    }

    const barcodesInImport = new Set(consolidatedRows.map((r) => r.barcode));
    const barcodesInFallback = new Set([...fallbackRowMap.keys()]);

    /**
     * ============================================================
     * 5) PRODUCTOS
     * ============================================================
     */

    const importBarcodes = consolidatedRows.map((r) => r.barcode);

    const products = await Product.find({
      $or: [
        { barcode: { $in: importBarcodes } },
        { alternateBarcodes: { $in: importBarcodes } },
      ],
    });

    const productsMap = new Map();

    for (const p of products) {
      if (p.barcode) productsMap.set(normalize(p.barcode), p);

      for (const alt of p.alternateBarcodes || []) {
        productsMap.set(normalize(alt), p);
      }
    }

    /**
     * ============================================================
     * 6) BULK PRODUCT UPDATES
     * ============================================================
     */

    const bulkUpdates = [];
    const priceHistoryDocs = [];

    /**
     * ============================================================
     * 7) RESULTADOS POR LISTA
     * ============================================================
     */

    const resultByList = [];

    const findImportRowForProduct = (product) => {
      const candidates = [
        normalize(product.barcode),
        ...(product.alternateBarcodes || []).map(normalize),
      ].filter(Boolean);

      for (const code of candidates) {
        const row = consolidatedMap.get(code);
        if (row) {
          return {
            row,
            source: "own",
            branchName: stockImport.branch?.name,
            importId: stockImport._id,
            importedAt: stockImport.importedAt,
          };
        }
      }

      for (const code of candidates) {
        const fallback = fallbackRowMap.get(code);
        if (fallback?.row) {
          return {
            row: fallback.row,
            source: "fallback",
            branchName: fallback.branchName,
            importId: fallback.importId,
            importedAt: fallback.importedAt,
          };
        }
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

      for (const item of list.products) {
        const product = item?.product;
        const lastTagDate = item?.lastTagDate;

        if (!product) continue;

        const imported = findImportRowForProduct(product);
        if (!imported) continue;

        const importRow = imported.row;

        const newPrice = Number(importRow.price);
        const oldPrice = product.currentPrice ?? 0;

        if (newPrice !== oldPrice) {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { currentPrice: newPrice } },
            },
          });

          priceHistoryDocs.push({
            productId: product._id,
            price: newPrice,
            date: now,
            operator:
              imported.source === "fallback" ? "fallback-import" : "import",
          });

          product.currentPrice = newPrice;
        }

        const isFirst = !lastTagDate;
        const taggedNow = isFirst || newPrice !== oldPrice;

        if (taggedNow) {
          // actualizamos la fecha de etiquetado
          await ProductList.updateOne(
            { _id: list._id, "products.product": product._id },
            { $set: { "products.$.lastTagDate": now } },
          );
          // reflejar en memoria
          item.lastTagDate = now;
        }

        // construimos el payload
        const payload = {
          _id: product._id,
          barcode: product.barcode,
          name: product.name,
          previousTagDate: lastTagDate || null,
          taggedNow,
          taggedAt: taggedNow ? now : null,
          priceSource: imported.source,
          sourceBranchName: imported.branchName,
          sourceImportId: imported.importId,
          sourceImportDate: imported.importedAt,
        };

        // pusheamos en la lista correcta según si es primera vez o cambio de precio
        if (isFirst) {
          listResult.firstTimeSet.push({ ...payload, oldPrice, newPrice });
        } else if (newPrice > oldPrice) {
          listResult.priceIncreased.push({ ...payload, oldPrice, newPrice });
        } else if (newPrice < oldPrice) {
          listResult.priceDecreased.push({ ...payload, oldPrice, newPrice });
        } else {
          listResult.priceUnchanged.push({ ...payload, price: newPrice });
        }

        listResult.stockUpdated.push({
          ...payload,
          stock: importRow.stock ?? 0,
        });
      }

      for (const item of list.products) {
        const product = item?.product;
        const lastTagDate = item?.lastTagDate;

        if (!product) continue;

        const candidates = [
          normalize(product.barcode),
          ...(product.alternateBarcodes || []).map(normalize),
        ].filter(Boolean);

        const foundInOwn = candidates.some((c) => barcodesInImport.has(c));
        const foundInFallback = candidates.some((c) =>
          barcodesInFallback.has(c),
        );

        if (!foundInOwn && !foundInFallback) {
          listResult.missingInImport.push({
            barcode: product.barcode || "—",
            name: product.name,
            price: product.currentPrice,
            previousTagDate: lastTagDate || null,
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
    }

    /**
     * ============================================================
     * 8) BULK WRITE PRODUCTOS
     * ============================================================
     */

    if (bulkUpdates.length) {
      await Product.bulkWrite(bulkUpdates);
    }

    if (priceHistoryDocs.length) {
      const histories = await PriceHistory.insertMany(priceHistoryDocs);

      const historyUpdates = histories.map((h) => ({
        updateOne: {
          filter: { _id: h.productId },
          update: { $push: { priceHistory: h._id } },
        },
      }));

      await Product.bulkWrite(historyUpdates);
    }

    stockImport.status = "applied";
    await stockImport.save();

    return res.json({
      message: "Precios y stock actualizados desde la importación",
      lists: resultByList,
    });
  } catch (error) {
    console.error("❌ Error al actualizar desde importación:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

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

      if (Array.isArray(p.barcode))
        p.barcode.forEach((c) => allBarcodes.add(String(c).trim()));

      if (Array.isArray(p.alternateBarcodes))
        p.alternateBarcodes.forEach((c) => allBarcodes.add(String(c).trim()));

      if (Array.isArray(p.alternateBarcodes))
        p.alternateBarcodes.forEach((c) => allBarcodes.add(String(c).trim()));
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
          !isNaN(Number(r.price)) && r.price !== null && r.price !== undefined,
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
      if (Array.isArray(p.barcode))
        for (const c of p.barcode) if (c) productsMap.set(String(c).trim(), p);
      if (Array.isArray(p.alternateBarcodes))
        for (const c of p.alternateBarcodes)
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
      existingStocks.map((s) => [`${s.product}_${s.branch}`, s]),
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
      keepIds,
    );

    const deleteResult = await StockImport.deleteMany({
      branch: stockImport.branch,
      status: "applied",
      _id: { $nin: keepIds },
    });

    console.log(
      `🧹 Cleanup applied imports: deletedCount=${deleteResult.deletedCount}`,
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
      `🧹 Cleanup PENDING: mantengo=${keepPendingIds.length} borradas=${deletePending.deletedCount}`,
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
