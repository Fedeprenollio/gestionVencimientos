import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  operator: { type: String }, // opcional: quién hizo el cambio
});
priceHistorySchema.index({ productId: 1 });

export default mongoose.model("PriceHistory", priceHistorySchema);
