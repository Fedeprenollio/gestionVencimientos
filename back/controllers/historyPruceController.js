import PriceHistory from "../models/PriceHistory.js";
import ProductList from "../models/ProductList.js";
// comparePricesByDateSeparateCollections

export const comparePricesByDateSeparateCollections = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const fromStart = new Date(new Date(from).setHours(0, 0, 0, 0));
    const toEnd = new Date(new Date(to).setHours(23, 59, 59, 999));

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Parámetros 'from' y 'to' son requeridos" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const list = await ProductList.findById(id).populate("products");

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });
    // console.log("list",list)
    const results = [];

    for (const product of list.products) {
      console.log("list.products", list.products);
      // Buscar precio más reciente anterior o igual a fromDate
      const fromPriceEntry = await PriceHistory.findOne({
        productId: product._id,
        date: { $gte: fromStart, $lte: toEnd },
      }).sort({ date: 1 }); // más antiguo dentro del <rang></rang>

      // Buscar precio más reciente anterior o igual a toDate
      const toPriceEntry = await PriceHistory.findOne({
        productId: product._id,
        date: { $gte: fromStart, $lte: toEnd },
      }).sort({ date: -1 }); // más nuevo dentro del rango

      if (fromPriceEntry && toPriceEntry) {
        results.push({
          _id: product._id,
          barcode: product.barcode,
          name: product.name,
          fromPrice: fromPriceEntry.price,
          toPrice: toPriceEntry.price,
          changed: fromPriceEntry.price !== toPriceEntry.price,
        });
      }
    }

    res.json({ listName: list.name, products: results });
  } catch (error) {
    console.error("Error comparando precios con colecciones separadas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
