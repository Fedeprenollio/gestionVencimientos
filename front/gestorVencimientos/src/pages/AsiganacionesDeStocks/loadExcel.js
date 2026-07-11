// services/loadExcel.js

import * as XLSX from "xlsx";

export const loadExcel = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ningún archivo."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;

        const workbook = XLSX.read(data, {
          type: "binary",
        });

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          reject(new Error("El archivo no contiene hojas."));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet);

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo."));
    };

    reader.readAsBinaryString(file);
  });
};