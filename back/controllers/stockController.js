import Stock from "../models/Stock.js";

export const upsertStock = async (req, res) => {
  try {
    const { productId, branchId, quantity } = req.body;

    if (!productId || !branchId) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const stock = await Stock.findOneAndUpdate(
      { product: productId, branch: branchId },
      {
        quantity,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ stock });
  } catch (err) {
    console.error("Error actualizando stock", err);
    res.status(500).json({ message: "Error al actualizar el stock" });
  }
};

export const getProductsWithStock = async (req, res) => {
  try {
    const { branchId } = req.params;

    const stockList = await Stock.find({ branch: branchId, quantity: { $gt: 0 } })
      .populate("product");

    const products = stockList.map((entry) => ({
      ...entry.product.toObject(),
      quantity: entry.quantity,
    }));

    res.json(products);
  } catch (err) {
    console.error("Error obteniendo productos con stock", err);
    res.status(500).json({ message: "Error al obtener productos con stock" });
  }
};

export const bulkUpdateStock = async (req, res) => {
  try {
    const { items, branchId } = req.body;

    if (!Array.isArray(items) || !branchId) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const operations = items.map(({ productId, quantity }) => ({
      updateOne: {
        filter: { product: productId, branch: branchId },
        update: { $set: { quantity } },
        upsert: true,
      },
    }));

    await Stock.bulkWrite(operations);
    res.json({ message: `Stock actualizado para ${items.length} productos.` });
  } catch (error) {
    console.error("Error en bulkUpdateStock:", error);
    res.status(500).json({ message: "Error actualizando stock." });
  }
};

export const getStockByBranch =async (req, res) => {
  const { branchId } = req.params;

  try {
    const stock = await Stock.find({ branch: branchId });

    // 🔁 Devolver un diccionario tipo { codebar: quantity }
    const result = {};
    stock.forEach((item) => {
      result[item.codebar] = item.quantity;
    });

    res.json(result);
  } catch (err) {
    console.error("Error al obtener stock por sucursal:", err);
    res.status(500).json({ message: "Error al obtener stock" });
  }
}