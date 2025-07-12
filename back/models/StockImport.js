// models/StockImport.js
import mongoose from 'mongoose';

const stockRowSchema = new mongoose.Schema({
  barcode: { type: String },              // Codebar
  name: { type: String },                 // producto
  stock: { type: Number },                // Cantidad
  category: { type: String },             // Rubro
  price: { type: Number },                // Precio
  cost: { type: Number },                 // costo
  lab: { type: String },                  // Laboratorio
  barcodes: [{ type: String }],          // CodigosBarra (como array)
});

const stockImportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  importedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'applied'], default: 'pending' },
  rows: [stockRowSchema],
});

stockImportSchema.index({ importedAt: -1 });


export default mongoose.model('StockImport', stockImportSchema);
