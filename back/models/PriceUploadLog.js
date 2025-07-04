// models/PriceUploadLog.js
import mongoose from "mongoose";

const priceUploadLogSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductList", required: true },
  listName: String,
  fileName: String,
  createdAt: { type: Date, default: Date.now },
  priceIncreased: Array,
  priceDecreased: Array,
  priceUnchanged: Array,
  firstTimeSet: Array,
  missingInExcel: Array,
  notInAnyList: Array,
});

export default mongoose.model("PriceUploadLog", priceUploadLogSchema);
