// controllers/productListController.js
import ProductList from "../models/ProductList.js";
import Product from "../models/Product.js";
import XLSX from "xlsx";
import PriceHistory from "../models/PriceHistory.js";

export const createProductList = async (req, res) => {
  try {
    const list = new ProductList(req.body);
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductListsByBranch = async (req, res) => {
  try {
    const lists = await ProductList.find({
      branch: req.params.branchId,
    }).populate("products");
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeProductFromList = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    list.products = list.products.filter(
      (id) => id.toString() !== req.params.productId
    );
    await list.save();

    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductList = async (req, res) => {
  try {
    const result = await ProductList.findByIdAndDelete(req.params.listId);
    if (!result)
      return res.status(404).json({ message: "Lista no encontrada" });
    res.json({ message: "Lista eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/listController.js
export const addProductToList = async (req, res) => {
  const { listId, productId } = req.params; // lista
  // const { productId } = req.body;
  console.log("listId", listId);

  const list = await ProductList.findById(listId);
  if (!list) return res.status(404).json({ message: "Lista no encontrada" });

  if (!list.products.includes(productId)) {
    list.products.push(productId);
    await list.save();
  }

  res.json(list);
};

export const getProductListById = async (req, res) => {
  console.log("get list", req.params.id);
  try {
    const list = await ProductList.findById(req.params.id)
      .populate("branch", "name") // si querés mostrar la sucursal
      .populate("products"); // si querés incluir los productos

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });
    res.json(list);
  } catch (err) {
    console.error("Error al obtener la lista por ID:", err);
    res.status(500).json({ message: "Error al obtener la lista" });
  }
};

// controllers/productListController.js

export const addQuickProducts = async (req, res) => {
  const { listId } = req.params;
  const { items } = req.body; // [{ barcode, name }]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });

    const existingBarcodes = new Set(list.quickProducts.map((p) => p.barcode));
    const newItems = items.filter(
      (item) => !existingBarcodes.has(item.barcode)
    );

    list.quickProducts.push(...newItems);
    await list.save();

    res.json(list.quickProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar códigos rápidos" });
  }
};

export const getQuickProducts = async (req, res) => {
  const { listId } = req.params;
  try {
    const list = await ProductList.findById(listId);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });
    res.json(list.quickProducts || []);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos rápidos" });
  }
};

// controllers/productListController.js

export const updateQuickProducts = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // [{ barcode, name? }]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items debe ser un array" });
  }

  try {
    const list = await ProductList.findById(id);
    if (!list) return res.status(404).json({ error: "Lista no encontrada" });

    // Validar cada item
    const validItems = items
      .filter((item) => item.barcode && typeof item.barcode === "string")
      .map((item) => ({
        barcode: item.barcode.trim(),
        name: item.name?.trim() || "",
      }));

    list.quickProducts = validItems;
    await list.save();

    res.json(list.quickProducts);
  } catch (err) {
    console.error("Error al actualizar quickProducts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const clearQuickProducts = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    list.quickProducts = [];
    await list.save();

    res.json({ message: "Productos rápidos eliminados" });
  } catch (err) {
    console.error("Error al eliminar productos rápidos", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const comparePricesByDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    console.log("from, to", from, to);

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Parámetros 'from' y 'to' son requeridos" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const list = await ProductList.findById(id).populate("products");

    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const result = [];

    for (const product of list.products) {
      const history = product.priceHistory || [];

      const fromPrices = history.filter(
        (h) => new Date(h.date) >= fromDate && new Date(h.date) < toDate
      );
      const toPrices = history.filter((h) => new Date(h.date) >= toDate);

      const oldestFrom = fromPrices[0];
      const newestTo = toPrices[toPrices.length - 1];

      if (oldestFrom && newestTo) {
        const changed = oldestFrom.price !== newestTo.price;

        result.push({
          _id: product._id,
          barcode: product.barcode,
          name: product.name,
          fromPrice: oldestFrom.price,
          toPrice: newestTo.price,
          changed,
        });
      }
    }
    console.log("result", result);
    res.json({ listName: list.name, products: result });
  } catch (error) {
    console.error("Error comparando precios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const uploadPricesForList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Product list is empty or invalid" });
    }

    // Buscamos la lista y sus productos (asegurate que 'name' esté en el populate)
    const list = await ProductList.findById(listId).populate("products", "barcode _id name");
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    // Creamos un Set para barcodes de la lista
    const barcodesSet = new Set(list.products.map(p => p.barcode));

    const updated = [];
    const notUpdated = [];

    for (const item of products) {
      const { barcode, price } = item;
      if (!barcode || typeof price !== "number") continue;

      // Buscamos producto en la lista
      const productInList = list.products.find(p => p.barcode === barcode);
      if (productInList) {
        // Actualizar precio actual
        await Product.findByIdAndUpdate(productInList._id, { currentPrice: price });

        // Guardar historial de precios
        await PriceHistory.create({
          productId: productInList._id,
          price,
        });

        updated.push({
          barcode,
          price,
          name: productInList.name,
        });
      } else {
        notUpdated.push({ barcode, price });
      }
    }

    return res.json({
      message: `Precios actualizados para la lista ${list.name}`,
      updated,
      notUpdated,
    });
  } catch (error) {
    console.error("Error updating prices for list:", error);
    return res.status(500).json({ message: "Error del servidor actualizando precios" });
  }
};