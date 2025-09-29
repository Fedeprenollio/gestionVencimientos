// import React, { useState } from "react";
// import * as XLSX from "xlsx";

// export default function TablaAExcelCofa() {
//   const [tablasHtml, setTablasHtml] = useState([""]);

//   const limpiarNumero = (txt) => {
//     if (!txt) return 0;
//     txt = String(txt).replace(/\$/g, "").trim();
//     return parseFloat(txt) || 0;
//   };

//   const handleChange = (idx, value) => {
//     const nuevas = [...tablasHtml];
//     nuevas[idx] = value;
//     setTablasHtml(nuevas);
//   };

//   const agregarTextarea = () => {
//     setTablasHtml([...tablasHtml, ""]);
//   };

  

//   const limpiarDescuento = (txt) => {
//     if (!txt) return "";
//     txt = txt.replace("%", "").replace(",", ".").trim();
//     return txt;
//   };

//   const exportarExcel = () => {
//     const todasFilas = [];

//     tablasHtml.forEach((html) => {
//       if (!html) return;

//       const div = document.createElement("div");
//       div.innerHTML = html;

//       const rows = div.querySelectorAll("tbody tr");

//       Array.from(rows).forEach((row) => {
//         const cells = row.querySelectorAll("td");

//         Código de barras desde data-small-description
//         const desc = row.getAttribute("data-small-description") || "";
//         const codigoMatch = desc.match(/Cód\. de barra:<\/strong>\s*([\d]+)/);
//         const codigo = codigoMatch ? codigoMatch[1] : "";

//         Detectar promoción
//         const promo = !!row.querySelector('img[src*="icon_cart"]');

//         Construir fila
//         todasFilas.push({
//           CodigoBarras: codigo,
//           Producto: cells[0]?.innerText.trim() || "",
//           Lista: limpiarNumero(cells[3]?.innerText),
//           PrecioNormal: limpiarNumero(cells[4]?.innerText),
//           PrecioOferta: limpiarNumero(cells[5]?.innerText),
//           Descuento: limpiarDescuento(cells[6]?.innerText),
//           Promo: promo ? "SI" : "NO",
//           Stock: "",
//         });
//       });
//     });

//     if (todasFilas.length === 0) {
//       alert("No se encontraron filas para exportar");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(todasFilas);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Cofarsur");

//     XLSX.writeFile(wb, "cofarsur.xlsx");
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       {tablasHtml.map((tabla, idx) => (
//         <textarea
//           key={idx}
//           style={{ width: "100%", height: "200px", marginBottom: "10px" }}
//           placeholder={`Pega aquí el HTML de la tabla #${idx + 1}`}
//           value={tabla}
//           onChange={(e) => handleChange(idx, e.target.value)}
//         />
//       ))}

//       <button onClick={agregarTextarea} style={{ marginRight: "10px" }}>
//         Agregar otra tabla
//       </button>

//       <button onClick={exportarExcel}>Descargar Excel</button>
//     </div>
//   );
// }

import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function TablaAExcelCofa() {
  const [tablasHtml, setTablasHtml] = useState([""]);

  const limpiarNumero = (txt) => {
    if (!txt) return 0;
    txt = String(txt).replace(/\$/g, "").trim();
    return parseFloat(txt) || 0;
  };

  const handleChange = (idx, value) => {
    const nuevas = [...tablasHtml];
    nuevas[idx] = value;
    setTablasHtml(nuevas);
  };

  const agregarTextarea = () => {
    setTablasHtml([...tablasHtml, ""]);
  };

  const limpiarDescuento = (txt) => {
    if (!txt) return "";
    txt = txt.replace("%", "").replace(",", ".").trim();
    return txt;
  };

  const exportarExcel = () => {
    let todasFilas = [];

    tablasHtml.forEach((html) => {
      if (!html) return;

      const div = document.createElement("div");
      div.innerHTML = html;

      const rows = div.querySelectorAll("tbody tr");

      Array.from(rows).forEach((row) => {
        const cells = row.querySelectorAll("td");

        // Código de barras desde data-small-description
        const desc = row.getAttribute("data-small-description") || "";
        const codigoMatch = desc.match(/Cód\. de barra:<\/strong>\s*([\d]+)/);
        const ean = codigoMatch ? codigoMatch[1] : "";

        // Detectar promoción
        const promo = !!row.querySelector('img[src*="icon_cart"]');

        // Construir fila
        todasFilas.push({
          EAN: ean,
          Producto: cells[0]?.innerText.trim() || "",
          Lista: limpiarNumero(cells[3]?.innerText),
          PrecioNormal: limpiarNumero(cells[4]?.innerText),
          "PRECIO COMERCIO C/IVA": limpiarNumero(cells[5]?.innerText),
          Descuento: limpiarDescuento(cells[6]?.innerText),
          Promo: promo ? "SI" : "NO",
          Stock: "",
        });
      });
    });

    if (todasFilas.length === 0) {
      alert("No se encontraron filas para exportar");
      return;
    }

    // 🔥 Filtrar duplicados, quedándonos con el menor precio
    const filasFiltradas = Object.values(
      todasFilas.reduce((acc, fila) => {
        const ean = fila.EAN || "SIN_EAN";
        if (!acc[ean] || fila["PRECIO COMERCIO C/IVA"] < acc[ean]["PRECIO COMERCIO C/IVA"]) {
          acc[ean] = fila;
        }
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(filasFiltradas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cofarsur");

    XLSX.writeFile(wb, "cofarsur.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      {tablasHtml.map((tabla, idx) => (
        <textarea
          key={idx}
          style={{ width: "100%", height: "200px", marginBottom: "10px" }}
          placeholder={`Pega aquí el HTML de la tabla #${idx + 1}`}
          value={tabla}
          onChange={(e) => handleChange(idx, e.target.value)}
        />
      ))}

      <button onClick={agregarTextarea} style={{ marginRight: "10px" }}>
        Agregar otra tabla
      </button>

      <button onClick={exportarExcel}>Descargar Excel</button>
    </div>
  );
}

