import xlsx from "xlsx";
import Product from "../models/Product.js";

export const importProducts = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No se envió ningún archivo." });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let count = 0;

    for (const row of data) {
      const barcode = String(row.Codebar).trim();
      const name = row.Producto?.toString().trim();

      if (!barcode || !name) continue;

      // Si no existe ya, lo creo
      const exists = await Product.findOne({ barcode });
      if (!exists) {
        await Product.create({ barcode, name });
        count++;
      }
    }

    res.json({ message: `Se importaron ${count} productos.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al procesar el archivo." });
  }
};
