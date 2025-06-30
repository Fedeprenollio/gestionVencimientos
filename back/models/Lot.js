// models/Lot.js
import mongoose from 'mongoose';

const lotSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  expirationDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  // branch: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

  createdAt: { type: Date, default: Date.now },
  overstock:{ type: Boolean},
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Lot', lotSchema);
