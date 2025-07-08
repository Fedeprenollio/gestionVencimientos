import PriceHistory from "../models/PriceHistory.js";
import ProductList from "../models/ProductList.js";
import Product from "../models/Product.js"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

export const comparePricesByDateSeparateCollections = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Parámetros 'from' y 'to' son requeridos" });
    }

    const fromStart = dayjs
      .tz(from, "America/Argentina/Buenos_Aires")
      .startOf("day")
      .utc()
      .toDate();
    const toEnd = dayjs
      .tz(to, "America/Argentina/Buenos_Aires")
      .endOf("day")
      .utc()
      .toDate();
    const product = await Product.findById(id).populate("priceHistory");
    console.log(product.priceHistory); // ¿Trae los documentos?

    const list = await ProductList.findById(id).populate({
      path: "products",
      populate: {
        path: "priceHistory",
        model: "PriceHistory",
      },
    });

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const result = [];

    for (const product of list.products) {
      const history = product.priceHistory || [];

      // Precio más reciente anterior a fromStart
      const prevPrices = history.filter((h) => h.date < fromStart);
      const prevPrice = prevPrices.length
        ? prevPrices.reduce((a, b) => (a.date > b.date ? a : b)).price
        : 0;

      // Precios dentro del rango from-to
      const inRange = history.filter(
        (h) => h.date >= fromStart && h.date <= toEnd
      );
      if (inRange.length === 0) continue;

      const sorted = inRange.sort((a, b) => a.date - b.date);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      const changed = first.price !== last.price;

      // Primer precio si el precio previo es 0 o no existe
      const isFirstPriceEver = prevPrice === 0;

      result.push({
        _id: product._id,
        barcode: product.barcode,
        name: product.name,
        fromPrice: first.price,
        toPrice: last.price,
        changed,
        firstPrice: isFirstPriceEver,
      });
    }

    res.json({ listName: list.name, products: result });
  } catch (error) {
    console.error("Error comparando precios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getPriceHistoryByProduct = async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const history = await PriceHistory.find({ productId: product._id })
      .sort({ date: -1 })
      .lean();
console.log("history,history",history)
    res.json({
      barcode: product.barcode,
      name: product.name,
      currentPrice: product.currentPrice,
      totalEntries: history.length,
      history,
    });
  } catch (error) {
    console.error("Error al obtener historial de precios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};