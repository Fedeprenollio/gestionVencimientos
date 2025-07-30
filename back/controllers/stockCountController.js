// controllers/stockCountController.js
import StockCountList from "../models/StockCountList.js";
import Product from "../models/Product.js";
import Branch from "../models/Branch.js";
import User from "../models/User.js";

// 1. Crear nueva lista de conteo
export const createStockCountList = async (req, res) => {
  try {
    const { name, branchId, userId } = req.body;

    console.log(name, branchId, userId )
    const newList = await StockCountList.create({
      name,
      branch: branchId,
      countedBy: userId,
    });
    res.status(201).json(newList);
  } catch (err) {
    console.error("Error al crear lista de conteo:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 2. Obtener todas las listas (opcional: por sucursal o usuario)
export const getAllStockCountLists = async (req, res) => {
  console.log("ACA ENTRA")
  try {
    const { branch, user } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (user) filter.countedBy = user;

    const lists = await StockCountList.find(filter)
      .populate("branch", "name")
      .populate("countedBy", "username")
      .sort({ createdAt: -1 });

    res.json(lists);
  } catch (err) {
    console.error("Error al obtener listas:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 3. Obtener lista por ID con productos
// export const getStockCountListById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("ID", id)
//     const list = await StockCountList.findById(id)
//       .populate("products.product", "barcode name")
//       .populate("branch", "name")
//       .populate("countedBy", "username");

//     if (!list) return res.status(404).json({ message: "Lista no encontrada" });

//     res.json(list);
//   } catch (err) {
//     console.error("Error al obtener lista:", err);
//     res.status(500).json({ message: "Error del servidor" });
//   }
// };
export const getStockCountListById = async (req, res) => {
  try {
    const { listId } = req.params;
    console.log("ID", listId);

    const list = await StockCountList.findById(listId)
       .populate({
        path: "products.product",
        select: "barcode name stock currentPrice priceHistory alternateBarcodes",
      })
      .populate("branch", "name location") // incluí "location" si la usás
      .populate("countedBy", "username");

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    res.json(list);
  } catch (err) {
    console.error("Error al obtener lista:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 4. Agregar producto (acumula cantidad si ya existe)
export const addProductToStockCountList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { barcode, quantity } = req.body;

    const product = await Product.findOne({ barcode });
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const list = await StockCountList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    const existingItem = list.products.find((item) => item.product.equals(product._id));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      list.products.push({ product: product._id, quantity });
    }

    await list.save();

    // Volvemos a cargar la lista con populate para ver el nombre de productos
    const updatedList = await StockCountList.findById(listId)
      .populate("products.product");

    // Obtenemos el producto agregado para mostrarlo directamente
    const addedItem = updatedList.products.find((item) =>
      item.product._id.equals(product._id)
    );

    res.json({
      message: "Producto agregado correctamente",
      addedProduct: {
        nombre: product.name,
        barcode: product.barcode,
        quantity: addedItem.quantity,
      },
      updatedList,
    });
  } catch (err) {
    console.error("Error al agregar producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};


// 5. Eliminar lista
export const deleteStockCountList = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StockCountList.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Lista no encontrada" });
    res.json({ message: "Lista eliminada" });
  } catch (err) {
    console.error("Error al eliminar lista:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 6. Eliminar producto de la lista
export const removeProductFromStockCountList = async (req, res) => {
  try {
    const { listId, productId } = req.params;
    const list = await StockCountList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });

    list.products = list.products.filter(
      (item) => !item.product.equals(productId)
    );

    await list.save();
    res.json({ message: "Producto eliminado de la lista" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};


export const getStockCountListsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
console.log(branchId)
    // Buscar listas que pertenezcan a la sucursal dada
    const lists = await StockCountList.find({ branch: branchId })
      .populate("branch", "name")
      .populate("countedBy", "username")
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error("Error al obtener listas por sucursal:", error);
    res.status(500).json({ message: "Error al obtener listas por sucursal" });
  }
};


export const updateListStock = async (req, res) => {
  try {
    const { name,branchId  } = req.body;
    const {listId} = req.params;
      console.log("branchId",branchId)

    if (!name) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const updated = await StockCountList.findByIdAndUpdate(
      listId,
      { name, branch: branchId },

      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error al editar lista:", error);
    res.status(500).json({ message: "Error al editar la lista" });
  }
}