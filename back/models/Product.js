
// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['medicamento', 'perfumeria'] },
});

export default mongoose.model('Product', productSchema);
