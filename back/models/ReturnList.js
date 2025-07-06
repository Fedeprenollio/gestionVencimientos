import mongoose from "mongoose";

const scannedReturnSchema = new mongoose.Schema({
  barcode: { type: String, required: true },
  quantity: { type: Number, required: true },
  loteId: { type: mongoose.Schema.Types.ObjectId, ref: "Lot", required: true },
  scannedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // opcional
  mode: { type: String, enum: ["scanner", "manual"], default: "scanner" }, // opcional
  note: { type: String }, // opcional
});

const returnListSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  month: Number,
  year: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lot" }],
  scannedReturns: [scannedReturnSchema], // <-- acá agregamos el array
  createdAt: { type: Date, default: Date.now },
});

const ReturnList = mongoose.model("ReturnList", returnListSchema);
export default ReturnList;
