import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function calcularNivel(item) {
  const dsi = item.dsi;
  if (dsi === Infinity) return "Sin consumo";
  if (dsi > 365) return "Sobrestock";
  if (dsi < 30) return "Crítico";
  if (dsi < 90) return "Bajo";
  return "Óptimo";
}

export function exportToExcel({ modo, dsiResultado, selectedProducts }) {
  const lista =
    modo === "todos"
      ? dsiResultado
      : dsiResultado.filter((item) =>
          selectedProducts.some((p) => p.title === item.producto)
        );

  // Agrupar por categoría
  const categorias = {
    Crítico: [],
    Bajo: [],
    Óptimo: [],
    Sobrestock: [],
    "Sin consumo": [],
  };

  lista.forEach((item) => {
    const nivel = item.nivel || calcularNivel(item);
    const row = {
      Codigo: item.codebar || "",
      Producto: item.producto || "",
      Nivel: nivel,
      Stock: Number(item.stock) || 0,
      "Ventas Anuales": Number(item.ventasAnuales) || 0,
      "Días de Inventario":
        item.dsi === Infinity ? "∞" : Number(item.dsi.toFixed(0)),
       "¿Dev por venc?": item.tuvoDevolucionVencimiento ? "Sí" : "No",
       

    };

    if (categorias[nivel]) {
      categorias[nivel].push(row);
    }
  });

  // Crear el workbook
  const workbook = XLSX.utils.book_new();

  Object.entries(categorias).forEach(([nombreHoja, datos]) => {
    if (datos.length > 0) {
      const sheet = XLSX.utils.json_to_sheet(datos);
      XLSX.utils.book_append_sheet(workbook, sheet, nombreHoja);
    }
  });

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename =
    modo === "todos"
      ? "inventario_por_categoria.xlsx"
      : "inventario_seleccion_por_categoria.xlsx";

  saveAs(blob, filename);
}
