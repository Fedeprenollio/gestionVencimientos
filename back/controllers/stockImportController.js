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

// export const importStock = async (req, res) => {
//   try {
//     const fileBuffer = req.file.buffer;
//     const parsedRows = parseExcelBuffer(fileBuffer); // Utilidad que convierte Excel a JSON

//     const formattedRows = parsedRows.map((row) => {
//       const barcodes = row['CodigosBarra']
//         ? row['CodigosBarra'].toString().split('-').map(code => code.trim())
//         : [];

//       return {
//         barcode: row['Codebar']?.toString().trim(),
//         name: row['producto']?.toString().trim(),
//         stock: Number(row['Cantidad']) || 0,
//         category: row['Rubro']?.toString().trim() || '',
//         price: Number(row['Precio']) || 0,
//         cost: Number(row['costo']) || 0,
//         lab: row['Laboratorio']?.toString().trim() || '',
//         barcodes,
//       };
//     });

//     const newImport = new StockImport({
//       user: req.user?._id,           // Si tenés auth, si no, omitilo
//       branch: req.body.branchId,     // O podés omitirlo si no usás sucursales
//       rows: formattedRows,
//     });

//     await newImport.save();

//     res.status(201).json({
//       message: 'Importación de stock guardada correctamente',
//       importId: newImport._id,
//       totalRows: formattedRows.length,
//     });
//   } catch (error) {
//     console.error("Error al importar stock:", error);
//     res.status(500).json({ error: "Error al procesar el Excel de stock" });
//   }
// };




export const importStock = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const parsedRows = parseExcelBuffer(fileBuffer); // Convierte Excel a JSON

    // Extraemos todos los códigos únicos para buscar de una vez
    const uniqueCodesSet = new Set();
    parsedRows.forEach((row) => {
      const barcodeRaw = row['Codebar']?.toString().trim() || "";
      const idProductoRaw = row['IDProducto']?.toString().trim() || "";

      if (barcodeRaw && barcodeRaw !== "0") uniqueCodesSet.add(barcodeRaw);
      if (idProductoRaw && idProductoRaw !== "0") uniqueCodesSet.add(idProductoRaw);
    });
    const uniqueCodes = Array.from(uniqueCodesSet);

    // Buscar todos los productos existentes de una sola vez
    const existingProducts = await Product.find({
      barcode: { $in: uniqueCodes },
    }).lean();

    // Map para búsqueda rápida por barcode
    const existingMap = new Map(
      existingProducts.map((p) => [p.barcode, p])
    );

    const newProductsToInsert = [];
    const formattedRows = [];

    for (const row of parsedRows) {
      const barcodeRaw = row['Codebar']?.toString().trim() || "";
      const barcode = barcodeRaw && barcodeRaw !== "0" ? barcodeRaw : null;
      const idProductoRaw = row['IDProducto']?.toString().trim() || "";
      const idProducto = idProductoRaw && idProductoRaw !== "0" ? idProductoRaw : null;

      const barcodes = row['CodigosBarra']
        ? row['CodigosBarra'].toString().split('-').map(code => code.trim())
        : [];

      // Ignorar filas sin código válido
      if (!barcode && !idProducto) continue;

      // Chequear si ya existe producto (por barcode o idProducto)
      let productExists = false;
      if (barcode && existingMap.has(barcode)) {
        productExists = true;
      } else if (idProducto && existingMap.has(idProducto)) {
        productExists = true;
      }

      // Crear producto nuevo si no existe y hay idProducto válido
      if (!productExists && idProducto) {
        newProductsToInsert.push({
          barcode: idProducto,
          alternateBarcodes: barcodes,
          name: row['producto']?.toString().trim() || "Sin nombre",
          type: row['Rubro']?.toString().trim() || "medicamento",
          currentPrice: Number(row['Precio']) || 0,
        });

        // Marcar como existente para no crear duplicados si se repite fila
        existingMap.set(idProducto, true);
      }

      // Guardar fila formateada para importación
      formattedRows.push({
        barcode: barcode || idProducto,
        name: row['producto']?.toString().trim() || "Sin nombre",
        stock: Number(row['Cantidad']) || 0,
        category: row['Rubro']?.toString().trim() || "",
        price: Number(row['Precio']) || 0,
        cost: Number(row['costo']) || 0,
        lab: row['Laboratorio']?.toString().trim() || "",
        barcodes,
      });
    }

    // Insertar productos nuevos en bulk si hay
    let newProducts = [];
    if (newProductsToInsert.length > 0) {
      newProducts = await Product.insertMany(newProductsToInsert);
    }

    // Guardar la importación con las filas (stock, precio)
    const newImport = new StockImport({
      user: req.user?._id,
      branch: req.body.branchId,
      rows: formattedRows,
    });

    await newImport.save();

    return res.status(201).json({
      message: "Importación de stock guardada correctamente",
      importId: newImport._id,
      totalRows: formattedRows.length,
      newProducts, // <-- retorno para frontend
    });
  } catch (error) {
    console.error("Error al importar stock:", error);
    return res.status(500).json({ error: "Error al procesar el Excel de stock" });
  }
};
export const compareStockImport = async (req, res) => {
  try {
    const { importId } = req.params;
    const importData = await StockImport.findById(importId);
    if (!importData) {
      return res.status(404).json({ error: 'Importación no encontrada' });
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
      return res.status(400).json({ error: "Faltan datos importId o branchId" });
    }

    const importData = await StockImport.findById(importId);
    if (!importData) return res.status(404).json({ error: "Importación no encontrada" });

    if (importData.status === "applied") {
      return res.status(400).json({ error: "Esta importación ya fue aplicada" });
    }

    if (!importData.branch) {
      return res.status(400).json({ error: "La importación no tiene sucursal asociada" });
    }

    // Mapear productos por barcode para buscar rápido
    const barcodes = importData.rows.map((r) => r.barcode?.trim()).filter(Boolean);
    const products = await Product.find({ barcode: { $in: barcodes } });
    const productsMap = new Map(products.map((p) => [p.barcode.trim(), p]));

    // Stocks actuales para esta sucursal y productos
    const stocks = await Stock.find({
      branch: branchId,
      product: { $in: products.map((p) => p._id) },
    });
    const stockMap = new Map(stocks.map((s) => [`${s.product}_${s.branch}`, s]));

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

