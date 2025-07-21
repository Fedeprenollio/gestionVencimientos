import * as XLSX from "xlsx";

export function exportProjectedLossesToExcel(data) {
  const formattedData = data.map((item) => ({
    Producto: item.producto,
    Stock: item.stock,
    "Ventas Anuales": item.ventasAnuales,
    "Unidades sin vender": item.unidadesPerdidas,
    "Costo Unitario": item.costo,
    "Pérdida Proyectada": item.perdidaProyectada,
    DSI: item.dsi,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pérdidas proyectadas");

  XLSX.writeFile(workbook, "perdidas_proyectadas.xlsx");
}
