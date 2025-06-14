import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  barcode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['medicamento', 'perfumeria'], required: true },
  expirationDate: { type: Date, required: true },
  branch: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
