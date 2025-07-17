import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportProjectedLossesToExcel(data) {
  // Transformamos la data para exportar
  const dataToExport = data.map(item => {
    return {
      Producto: item.producto || "",
      "Costo Unitario": item.costo?.toFixed(2) || "0.00",
      Stock: item.stock || 0,
      "Pérdida Proyectada": Number((item.stock * item.costo).toFixed(2)),
      DSI: item.dsi === Infinity ? "∞" : item.dsi.toFixed(0),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pérdidas Proyectadas");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "perdidas_proyectadas.xlsx");
}
