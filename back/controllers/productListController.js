// controllers/productListController.js
import ProductList from '../models/ProductList.js';
import Product from '../models/Product.js';
import XLSX from 'xlsx';


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
    const lists = await ProductList.find({ branch: req.params.branchId }).populate('products');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const removeProductFromList = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

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
    if (!result) return res.status(404).json({ message: 'Lista no encontrada' });
    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// controllers/listController.js
export const addProductToList = async (req, res) => {
  const { listId,productId } = req.params; // lista
  // const { productId } = req.body;
  console.log("listId",listId)

  const list = await ProductList.findById(listId);
  if (!list) return res.status(404).json({ message: "Lista no encontrada" });

  if (!list.products.includes(productId)) {
    list.products.push(productId);
    await list.save();
  }

  res.json(list);
};


export const getProductListById = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.id)
      .populate('branch', 'name') // si querés mostrar la sucursal
      .populate('products'); // si querés incluir los productos

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
    const newItems = items.filter((item) => !existingBarcodes.has(item.barcode));

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




