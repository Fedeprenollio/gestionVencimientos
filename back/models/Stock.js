import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch", // o "Sucursal"
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

stockSchema.index({ product: 1, branch: 1 }, { unique: true });

export default mongoose.model("Stock", stockSchema);
