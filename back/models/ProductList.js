// // models/ProductList.js
// import mongoose from 'mongoose';

// const productListSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // e.g. "Jarabes para la tos"
//   branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
//   products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
// });

// export default mongoose.model('ProductList', productListSchema);

// models/ProductList.js
import mongoose from 'mongoose';

const quickProductSchema = new mongoose.Schema({
  barcode: { type: String, required: true },
  name: { type: String }, // opcional
});

const productListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  quickProducts: [quickProductSchema], // 🆕 productos cargados rápidamente
});

export default mongoose.model('ProductList', productListSchema);
