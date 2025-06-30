// controllers/productListController.js
import ProductList from '../models/ProductList.js';
import Product from '../models/Product.js';

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

export const addProductToList = async (req, res) => {
  try {
    const list = await ProductList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: 'Lista no encontrada' });

    if (!list.products.includes(req.params.productId)) {
      list.products.push(req.params.productId);
      await list.save();
    }

    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
