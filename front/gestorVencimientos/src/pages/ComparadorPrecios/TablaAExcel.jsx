import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function TablaAExcel() {
  const [htmlTabla, setHtmlTabla] = useState("");

  const exportarExcel = () => {
    if (!htmlTabla) {
      alert("Pega el HTML de la tabla primero");
      return;
    }

    // Creamos un contenedor temporal para parsear el HTML
    const div = document.createElement("div");
    div.innerHTML = htmlTabla;

    const rows = div.querySelectorAll("tbody tr");

    const datos = Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");

      // Extraer código de barras desde onmouseover si existe
      const onmouseover = cells[1]?.getAttribute("onmouseover") || "";
      const codigoMatch = onmouseover.match(/Cod\.Barras:[^0-9]*(\d{12,13})/);
      const codigo = codigoMatch ? codigoMatch[1] : "";

      // Detectar promoción revisando si el td tiene fondo amarillo
      const esPromo =
        cells[7]?.getAttribute("style")?.includes("#FFD966") ||
        cells[7]?.style?.backgroundColor === "rgb(255, 217, 102)"; // por si el navegador lo transforma a RGB

      return {
        CodigoBarras: codigo,
        Producto: cells[1]?.textContent.trim() || "",
        Cant: cells[2]?.querySelector("input")?.value || "",
        Bulto: cells[3]?.textContent.trim() || "",
        Stock: cells[4]?.textContent.trim() || "",
        Precio_s_IVA: cells[5]?.textContent.trim() || "",
        Oferta: cells[6]?.textContent.trim() || "",
        Promo: esPromo ? "SI" : "NO", // 👉 Nueva columna
        Precio_c_Dto_s_IVA: cells[7]?.textContent.trim() || "",
        Precio_Publico: cells[8]?.textContent.trim() || "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "productos.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      <textarea
        style={{ width: "100%", height: "300px" }}
        placeholder="Pega aquí el HTML de la tabla"
        value={htmlTabla}
        onChange={(e) => setHtmlTabla(e.target.value)}
      />
      <button onClick={exportarExcel} style={{ marginTop: "10px" }}>
        Descargar Excel
      </button>
    </div>
  );
}
