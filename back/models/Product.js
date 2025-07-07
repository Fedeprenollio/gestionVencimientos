// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  alternateBarcodes: [{ type: String }],
  name: { type: String, required: true },
  type: { type: String, enum: ["medicamento", "perfumeria"] },
  currentPrice: { type: Number, default: 0 },
  priceHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceHistory",
    },
  ],
});

export default mongoose.model("Product", productSchema);
// [{ type: mongoose.Schema.Types.ObjectId, ref: "PriceHistory" }]