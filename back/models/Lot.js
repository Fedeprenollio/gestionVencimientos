// models/Lot.js
import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  expirationDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  // branch: { type: String, required: true },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
    // NUEVOS CAMPOS PARA TRAZABILIDAD
  batchNumber: { type: String },     // Número de lote (puede venir del QR)
  serialNumber: { type: String },    // Número de serie (puede venir del QR)
  gtin: { type: String },            // Código de producto global (opcional)

  createdAt: { type: Date, default: Date.now },
  overstock: { type: Boolean },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   returned: {
    status: { type: Boolean, default: false },
    date: Date,
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
});

export default mongoose.model("Lot", lotSchema);
