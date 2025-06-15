import mongoose from "mongoose";


const lotSchema = new mongoose.Schema({
  expirationDate: {
    type: Date, // "YYYY-MM"
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  type: String,
  lots: [lotSchema],
});

export default mongoose.model("Product", productSchema);
