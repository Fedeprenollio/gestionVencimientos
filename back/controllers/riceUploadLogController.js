import ProductList from "../models/ProductList.js";
import Product from "../models/Product.js";
import PriceHistory from "../models/PriceHistory.js";
import PriceUploadLog from "../models/PriceUploadLog.js";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(tz);

export const uploadPricesForMultipleLists = async (req, res) => {
  try {
    const { products, listIds, fileName } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Lista de productos vacía" });
    }

    if (!Array.isArray(listIds) || listIds.length === 0) {
      return res.status(400).json({ message: "No se indicaron listas a actualizar" });
    }

    const selectedLists = await ProductList.find({
      _id: { $in: listIds },
    }).populate("products.product");

    const nowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").toDate();
    const barcodesFromExcel = products.map((p) => p.barcode);
    const notInAnyList = [];

    const resultByList = [];

    for (const list of selectedLists) {
      const mapListProducts = new Map();
      for (const item of list.products) {
        if (item.product?.barcode) {
          mapListProducts.set(item.product.barcode, item.product);
        }
      }

      const changes = {
        listId: list._id,
        listName: list.name,
        priceIncreased: [],
        priceDecreased: [],
        priceUnchanged: [],
        firstTimeSet: [],
        missingInExcel: [],
      };

      for (const { barcode, price } of products) {
        if (!barcode || typeof price !== "number") continue;
        const product = mapListProducts.get(barcode);
        if (!product) continue;

        const oldPrice = product.currentPrice ?? 0;

        if (!oldPrice) {
          await Product.findByIdAndUpdate(product._id, { currentPrice: price });
          const history = await PriceHistory.create({
            productId: product._id,
            price,
            date: nowArgentina,
          });
          await Product.findByIdAndUpdate(product._id, { $push: { priceHistory: history._id } });

          changes.firstTimeSet.push({ barcode, name: product.name, newPrice: price });
        } else if (price === oldPrice) {
          const fullProduct = await Product.findById(product._id);
          const hasHistory = fullProduct.priceHistory?.length > 0;

          if (!hasHistory) {
            const history = await PriceHistory.create({ productId: product._id, price, date: nowArgentina });
            await Product.findByIdAndUpdate(product._id, { $push: { priceHistory: history._id } });

            changes.firstTimeSet.push({ barcode, name: product.name, newPrice: price });
          } else {
            changes.priceUnchanged.push({ barcode, name: product.name, price });
          }
        } else {
          await Product.findByIdAndUpdate(product._id, { currentPrice: price });
          const history = await PriceHistory.create({ productId: product._id, price, date: nowArgentina });
          await Product.findByIdAndUpdate(product._id, { $push: { priceHistory: history._id } });

          const entry = { barcode, name: product.name, oldPrice, newPrice: price };
          if (price > oldPrice) changes.priceIncreased.push(entry);
          else changes.priceDecreased.push(entry);
        }
      }

      for (const item of list.products) {
        const prod = item.product;
        if (prod?.barcode && !barcodesFromExcel.includes(prod.barcode)) {
          changes.missingInExcel.push({
            barcode: prod.barcode,
            name: prod.name,
            price: prod.currentPrice ?? 0,
            lastTagDate: item.lastTagDate ?? null,
          });
        }
      }

      resultByList.push(changes);
    }

    const allListBarcodes = new Set(
      selectedLists.flatMap((list) => list.products.map((item) => item.product?.barcode))
    );

    for (const { barcode, price } of products) {
      if (!allListBarcodes.has(barcode)) {
        notInAnyList.push({ barcode, price });
      }
    }

    // ✅ Guardar logs por cada lista
    for (const listResult of resultByList) {
      await PriceUploadLog.create({
        uploadedBy: req.user?._id || null,
        listId: listResult.listId,
        listName: listResult.listName,
        fileName: fileName || null,
        createdAt: nowArgentina,
        priceIncreased: listResult.priceIncreased,
        priceDecreased: listResult.priceDecreased,
        priceUnchanged: listResult.priceUnchanged,
        firstTimeSet: listResult.firstTimeSet,
        missingInExcel: listResult.missingInExcel,
        notInAnyList,
      });
    }

    res.json({
      message: `Precios actualizados para ${selectedLists.length} listas`,
      lists: resultByList,
      notInAnyList,
    });
  } catch (error) {
    console.error("Error al subir precios para múltiples listas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
