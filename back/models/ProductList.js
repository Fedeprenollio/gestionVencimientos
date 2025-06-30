// models/ProductList.js
import mongoose from 'mongoose';

const productListSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Jarabes para la tos"
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

export default mongoose.model('ProductList', productListSchema);
