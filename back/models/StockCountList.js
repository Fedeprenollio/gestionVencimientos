// models/StockCountList.js
import mongoose from "mongoose";

const countedProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const stockCountListSchema = new mongoose.Schema({
  name: { type: String }, // opcional: "Recuento Sucursal Centro 04/07"
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  countedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  products: [countedProductSchema],
});

export default mongoose.model("StockCountList", stockCountListSchema);
