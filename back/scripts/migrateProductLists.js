// scripts/migrateProductLists.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductList from "../models/ProductList.js";

dotenv.config();

const migrateProductLists = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Conectado a MongoDB");

    const lists = await ProductList.find();

    for (const list of lists) {
      let modified = false;

      list.products = list.products.map((entry) => {
        // Si es un ObjectId suelto (forma vieja), lo migramos
        if (
          typeof entry === "object" &&
          entry !== null &&
          !entry.product &&
          !entry.lastTagDate
        ) {
          modified = true;
          return { product: entry, lastTagDate: null };
        }

        // Si ya está bien estructurado, lo dejamos como está
        return entry;
      });

      if (modified) {
        await list.save();
        console.log(`✅ Lista ${list._id} migrada`);
      }
    }

    console.log("🎉 Migración completa");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error en migración:", error);
    process.exit(1);
  }
};

migrateProductLists();
