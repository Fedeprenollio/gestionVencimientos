// controllers/stockImportController.js
import crypto from "crypto";

import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import StockImport from "../models/StockImport.js";
import { parseExcelBuffer } from "../utils/parseExcel.js";

export const listStockImports = async (req, res) => {
  try {
    const { branchId } = req.query;

    const query = {};
    if (branchId) query.branch = branchId;

    const imports = await StockImport.find(query)
      .sort({ importedAt: -1 })
      .limit(50); // o lo que prefieras

    res.json(imports);
  } catch (error) {
    console.error("Error listando importaciones:", error);
    res.status(500).json({ error: "Error al obtener importaciones" });
  }
};

export const importStock = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const parsedRows = parseExcelBuffer(fileBuffer); // Convierte Excel a JSON

    // Extraemos todos los códigos únicos para buscar de una vez
    const uniqueCodesSet = new Set();
    parsedRows.forEach((row) => {
      const barcodeRaw = row["Codebar"]?.toString().trim() || "";
      const idProductoRaw = row["IDProducto"]?.toString().trim() || "";

      if (barcodeRaw && barcodeRaw !== "0") uniqueCodesSet.add(barcodeRaw);
      if (idProductoRaw && idProductoRaw !== "0")
        uniqueCodesSet.add(idProductoRaw);
    });
    const uniqueCodes = Array.from(uniqueCodesSet);

    // Buscar todos los productos existentes de una sola vez
    const existingProducts = await Product.find({
      barcode: { $in: uniqueCodes },
    }).lean();

    // Mapa para búsqueda rápida por barcode
    const existingMap = new Map(existingProducts.map((p) => [p.barcode, p]));

    const newProductsToInsert = [];
    const formattedRows = [];

    for (const row of parsedRows) {
      const barcodeRaw = row["Codebar"]?.toString().trim() || "";
      const barcode = barcodeRaw && barcodeRaw !== "0" ? barcodeRaw : null;
      const idProductoRaw = row["IDProducto"]?.toString().trim() || "";
      const idProducto =
        idProductoRaw && idProductoRaw !== "0" ? idProductoRaw : null;

      const barcodes = row["CodigosBarra"]
        ? row["CodigosBarra"]
            .toString()
            .split("-")
            .map((code) => code.trim())
        : [];

      // Ignorar filas sin códigos válidos
      if (!barcode && !idProducto) continue;

      // Buscar producto existente
      let product = null;

      if (barcode && existingMap.has(barcode)) {
        product = existingMap.get(barcode);
      } else if (idProducto && existingMap.has(idProducto)) {
        product = existingMap.get(idProducto);
      }

      const productExists = !!product;

      // --- 🔧 REPARAR NOMBRES "SIN NOMBRE" SI EL EXCEL TRAE UNO CORRECTO ---
      if (productExists) {
        const excelName = row["producto"]?.toString().trim() || "";
        const hasRealName = excelName && excelName !== "Sin nombre";

        if (product.name === "Sin nombre" && hasRealName) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { name: excelName } },
          );
          product.name = excelName; // también actualizar en memoria
        }
      }

      // Crear producto nuevo si no existe
      if (!productExists && idProducto) {
        const productName = row["producto"]?.toString().trim() || "Sin nombre";

        newProductsToInsert.push({
          barcode: idProducto,
          alternateBarcodes: barcodes,
          name: productName,
          type: row["Rubro"]?.toString().trim() || "medicamento",
          currentPrice: Number(row["Precio"]) || 0,
        });

        // Añadir al mapa para evitar duplicados en el mismo Excel
        existingMap.set(idProducto, { barcode: idProducto, name: productName });
      }

      // Guardar fila formateada para registrar la importación
      formattedRows.push({
        barcode: barcode || idProducto,
        name: row["producto"]?.toString().trim() || "Sin nombre",
        stock: Number(row["Cantidad"]) || 0,
        category: row["Rubro"]?.toString().trim() || "",
        price: Number(row["Precio"]) || 0,
        cost: Number(row["costo"]) || 0,
        lab: row["Laboratorio"]?.toString().trim() || "",
        barcodes,
      });
    }

    // Insertar productos nuevos si hay
    let newProducts = [];
    if (newProductsToInsert.length > 0) {
      newProducts = await Product.insertMany(newProductsToInsert);
    }

    // Guardar la importación con filas e info de stock
    const newImport = new StockImport({
      user: req.user?._id,
      branch: req.body.branchId,
      rows: formattedRows,
    });

    await newImport.save();

    // 🧹 CLEANUP: borrar imports pending viejas de la sucursal
const pendingDelete = await StockImport.deleteMany({
  branch: req.body.branchId,
  status: { $ne: "applied" }, // pending u otros
  _id: { $ne: newImport._id },
});

console.log(
  `🧹 Pending imports borradas: ${pendingDelete.deletedCount} (branch ${req.body.branchId})`
);

// 🧹 CLEANUP: dejar solo las últimas 2 applied por sucursal
const applied = await StockImport.find({
  branch: req.body.branchId,
  status: "applied",
})
  .sort({ appliedAt: -1, importedAt: -1, createdAt: -1 })
  .select("_id")
  .lean();

const toDeleteApplied = applied.slice(2);

if (toDeleteApplied.length > 0) {
  const appliedDelete = await StockImport.deleteMany({
    _id: { $in: toDeleteApplied.map((x) => x._id) },
  });

  console.log(
    `🧹 Applied imports borradas: ${appliedDelete.deletedCount} (branch ${req.body.branchId})`
  );
} else {
  console.log("🧹 No hay applied viejas para borrar (<=2).");
}


    return res.status(201).json({
      message: "Importación de stock guardada correctamente",
      importId: newImport._id,
      totalRows: formattedRows.length,
      newProducts,
    });
  } catch (error) {
    console.error("Error al importar stock:", error);
    return res
      .status(500)
      .json({ error: "Error al procesar el Excel de stock" });
  }
};

export const compareStockImport = async (req, res) => {
  try {
    const { importId } = req.params;
    const importData = await StockImport.findById(importId);
    if (!importData) {
      return res.status(404).json({ error: "Importación no encontrada" });
    }

    const { rows, branch } = importData;

    const comparison = [];

    for (const row of rows) {
      const product = await Product.findOne({ barcode: row.barcode });

      if (product) {
        // Buscar stock en la sucursal correspondiente
        const stockEntry = await Stock.findOne({
          product: product._id,
          branch: branch, // ID de la sucursal
        });

        comparison.push({
          barcode: row.barcode,
          nameDB: product.name,
          nameExcel: row.name,
          stockDB: stockEntry?.quantity ?? 0,
          stockExcel: row.stock,
          priceDB: product.price,
          priceExcel: row.price,
          match:
            (stockEntry?.quantity ?? 0) === row.stock &&
            product.price === row.price &&
            product.name === row.name,
        });
      } else {
        // Producto no encontrado en la DB
        comparison.push({
          barcode: row.barcode,
          nameExcel: row.name,
          stockExcel: row.stock,
          priceExcel: row.price,
          missingInDB: true,
        });
      }
    }

    res.json(comparison);
  } catch (err) {
    console.error("Error comparando stock:", err);
    res.status(500).json({ error: "Error al comparar stock" });
  }
};

export const applyStockImport = async (req, res) => {
  try {
    const { importId, listIds, branchId } = req.body;

    if (!importId || !branchId) {
      return res
        .status(400)
        .json({ error: "Faltan datos importId o branchId" });
    }

    const importData = await StockImport.findById(importId);
    if (!importData)
      return res.status(404).json({ error: "Importación no encontrada" });

    if (importData.status === "applied") {
      return res
        .status(400)
        .json({ error: "Esta importación ya fue aplicada" });
    }

    if (!importData.branch) {
      return res
        .status(400)
        .json({ error: "La importación no tiene sucursal asociada" });
    }

    // Mapear productos por barcode para buscar rápido
    const barcodes = importData.rows
      .map((r) => r.barcode?.trim())
      .filter(Boolean);
    const products = await Product.find({ barcode: { $in: barcodes } });
    const productsMap = new Map(products.map((p) => [p.barcode.trim(), p]));

    // Stocks actuales para esta sucursal y productos
    const stocks = await Stock.find({
      branch: branchId,
      product: { $in: products.map((p) => p._id) },
    });
    const stockMap = new Map(
      stocks.map((s) => [`${s.product}_${s.branch}`, s]),
    );

    let updatedProducts = 0;
    let createdProducts = 0;
    let updatedStock = 0;
    let createdStock = 0;

    const bulkProductUpdates = [];
    const bulkProductInserts = [];
    const bulkStockOps = [];
    const seenInsertStockKeys = new Set();

    for (const row of importData.rows) {
      const cleanBarcode = row.barcode?.trim();
      if (!cleanBarcode) continue;

      let product = productsMap.get(cleanBarcode);

      if (product) {
        // Actualizar producto existente
        product.name = row.name || product.name;
        product.price = row.price;
        product.cost = row.cost;
        product.category = row.category || product.category;
        product.lab = row.lab || product.lab;
        product.barcodes = row.barcodes || product.barcodes;

        bulkProductUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                name: product.name,
                price: product.price,
                cost: product.cost,
                category: product.category,
                lab: product.lab,
                barcodes: product.barcodes,
              },
            },
          },
        });

        updatedProducts++;
      } else {
        // Crear producto nuevo
        const newProduct = {
          barcode: cleanBarcode,
          name: row.name,
          price: row.price,
          cost: row.cost,
          category: row.category,
          lab: row.lab,
          barcodes: row.barcodes || [],
        };

        bulkProductInserts.push(newProduct);
      }
    }

    // Insertar productos nuevos en bulk
    if (bulkProductInserts.length > 0) {
      const insertedProducts = await Product.insertMany(bulkProductInserts);
      createdProducts += insertedProducts.length;

      // Actualizar mapa para productos nuevos
      for (const p of insertedProducts) {
        productsMap.set(p.barcode.trim(), p);
      }
    }

    // Preparar operaciones stock (ya con productos nuevos en productsMap)
    for (const row of importData.rows) {
      const cleanBarcode = row.barcode?.trim();
      if (!cleanBarcode) continue;

      const product = productsMap.get(cleanBarcode);
      if (!product) continue;

      const stockKey = `${product._id}_${branchId}`;
      const existingStock = stockMap.get(stockKey);

      if (existingStock) {
        bulkStockOps.push({
          updateOne: {
            filter: { _id: existingStock._id },
            update: {
              $set: {
                quantity: row.stock,
                lastUpdated: new Date(),
              },
            },
          },
        });
        updatedStock++;
      } else if (!seenInsertStockKeys.has(stockKey)) {
        seenInsertStockKeys.add(stockKey);
        bulkStockOps.push({
          insertOne: {
            document: {
              product: product._id,
              branch: branchId,
              quantity: row.stock,
              lastUpdated: new Date(),
            },
          },
        });
        createdStock++;
      }
    }

    // Ejecutar bulk updates de productos existentes
    if (bulkProductUpdates.length > 0) {
      await Product.bulkWrite(bulkProductUpdates);
    }
    // Ejecutar bulk operaciones stock
    if (bulkStockOps.length > 0) {
      await Stock.bulkWrite(bulkStockOps);
    }

    importData.status = "applied";
    await importData.save();
console.log("HOLA")
    // 🧹 Limpiar imports applied viejos (dejar solo los últimos 2 por sucursal)
    const appliedImports = await StockImport.find({
      branch: importData.branch,
      status: "applied",
    })
      .sort({ importedAt: -1 })
      .select("_id")
      .lean();

    console.log(
      `[StockImport Cleanup] branch=${importData.branch} appliedFound=${appliedImports.length}`,
    );

    const keep = appliedImports.slice(0, 2);
    const toDelete = appliedImports.slice(2).map((x) => x._id);

    console.log(
      `[StockImport Cleanup] keeping=${keep.map((x) => `${x._id}(${x.importedAt})`).join(" | ")}`,
    );

    if (toDelete.length > 0) {
      const deleteResult = await StockImport.deleteMany({
        _id: { $in: toDelete },
      });

      console.log(
        `[StockImport Cleanup] deleted=${deleteResult.deletedCount} expected=${toDelete.length}`,
      );
    } else {
      console.log(`[StockImport Cleanup] nothing to delete`);
    }

    res.json({
      message: "Importación aplicada correctamente",
      updatedProducts,
      createdProducts,
      updatedStock,
      createdStock,
    });
  } catch (error) {
    console.error("Error al aplicar importación:", error);
    res.status(500).json({ error: "Error al aplicar la importación" });
  }
};

export const updateAlternateBarcodesFromExcel = async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer) {
      return res.status(400).json({ error: "No se recibió archivo" });
    }

    const parsedRows = parseExcelBuffer(fileBuffer);

    const bulkOps = [];

    for (const row of parsedRows) {
      const barcode = row["Codebar"]?.toString().trim();
      const codigosBarraStr = row["CodigosBarra"]?.toString().trim();

      // Omitimos si no hay barcode o no hay códigos alternativos
      if (!barcode || !codigosBarraStr) continue;

      const codigosBarra = codigosBarraStr
        .split("-")
        .map((code) => code.trim())
        .filter((code) => code !== "");

      if (codigosBarra.length === 0) continue;

      bulkOps.push({
        updateOne: {
          filter: { barcode },
          update: {
            $set: {
              alternateBarcodes: codigosBarra,
            },
          },
        },
      });
    }

    if (bulkOps.length === 0) {
      return res
        .status(400)
        .json({ message: "No se encontraron filas válidas para actualizar." });
    }

    const result = await Product.bulkWrite(bulkOps);

    return res.status(200).json({
      message: "Productos actualizados correctamente.",
      totalFilasExcel: parsedRows.length,
      totalActualizados: result.modifiedCount,
      encontrados: result.matchedCount,
    });
  } catch (error) {
    console.error("Error al actualizar alternateBarcodes:", error);
    return res.status(500).json({ error: "Error al procesar el Excel" });
  }
};
