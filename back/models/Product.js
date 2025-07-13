// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  alternateBarcodes: [{ type: String }],
  idProductoExcel: { type: String }, 
  name: { type: String, required: true },
  // type: { type: String, enum: ["medicamento", "perfumeria"] },
  type: { type: String },
  currentPrice: { type: Number, default: 0 },
  priceHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceHistory",
    },
  ],
});
productSchema.index({ barcode: 1 }, { unique: true });
productSchema.index({ idProductoExcel: 1 }, { unique: true, sparse: true }); 

export default mongoose.model("Product", productSchema);
// [{ type: mongoose.Schema.Types.ObjectId, ref: "PriceHistory" }]