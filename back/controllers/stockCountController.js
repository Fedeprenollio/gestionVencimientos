// controllers/stockCountController.js
import StockCountList from "../models/StockCountList.js";
import Product from "../models/Product.js";

export const addScannedProduct = async (req, res) => {
  const { listId } = req.params;
  const { barcode, quantity } = req.body;

  if (!barcode || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ message: "Código y cantidad válidos son requeridos." });
  }

  try {
    const product = await Product.findOne({ barcode });
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });

    const list = await StockCountList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada." });

    const existing = list.products.find(p => p.product.equals(product._id));
    if (existing) {
      existing.quantity += quantity;
    } else {
      list.products.push({ product: product._id, quantity });
    }

    await list.save();

    res.json({ message: "Producto agregado al conteo", list });
  } catch (error) {
    console.error("Error al agregar producto al conteo:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
