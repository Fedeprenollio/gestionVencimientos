import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // ej: "Programa Bagó"
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Promotion", promotionSchema);
