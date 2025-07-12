import mongoose from "mongoose";
import StockImport from "../models/StockImport.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import PriceHistory from "../models/PriceHistory.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    // 👉 Sincronizar los índices (crear el de importedAt)
    await StockImport.syncIndexes();
    await Product.syncIndexes();
    await Stock.syncIndexes();
    await PriceHistory.syncIndexes();
    console.log("✅ Índices sincronizados en StockImport");
  } catch (err) {
    console.error("❌ Error al conectar MongoDB:", err);
    process.exit(1);
  }
};
