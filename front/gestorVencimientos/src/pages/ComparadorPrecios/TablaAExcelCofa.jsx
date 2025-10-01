import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function TablaAExcelCofa() {
  const [tablasHtml, setTablasHtml] = useState([""]);

  const limpiarNumero = (txt) => {
    if (!txt) return 0;
    txt = String(txt).replace(/\$/g, "").trim();
    return parseFloat(txt) || 0;
  };

  const limpiarDescuento = (txt) => {
    if (!txt) return "";
    txt = txt.replace("%", "").replace(",", ".").trim();
    return txt;
  };

  const handleChange = (idx, value) => {
    const nuevas = [...tablasHtml];
    nuevas[idx] = value;
    setTablasHtml(nuevas);
  };

  const agregarTextarea = () => {
    setTablasHtml([...tablasHtml, ""]);
  };

  // ✅ NUEVO: Cargar múltiples TXT como tablas HTML
  const handleTablasUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const contenido = String(ev.target.result || "");
        setTablasHtml((prev) => [...prev, contenido]); // Lo tratamos igual que pegar HTML
      };
      reader.readAsText(file, "utf-8");
    });
  };

//   const exportarExcel = () => {
//     let todasFilas = [];

//     tablasHtml.forEach((html) => {
//       if (!html) return;
//       const div = document.createElement("div");
//       div.innerHTML = html;
//       const rows = div.querySelectorAll("tbody tr");

//       Array.from(rows).forEach((row) => {
//         const cells = row.querySelectorAll("td");

//         const desc = row.getAttribute("data-small-description") || "";
//         const codigoMatch = desc.match(/Cód\. de barra:<\/strong>\s*([\d]+)/);
//         const ean = codigoMatch ? codigoMatch[1] : "";

//         const promo = !!row.querySelector('img[src*="icon_cart"]');

//         const precioNormal = limpiarNumero(cells[4]?.innerText);
//         let precioComercio = limpiarNumero(cells[5]?.innerText);

        

//         // Si PRECIO COMERCIO C/IVA está vacío o 0, usamos PrecioNormal
//         if (!precioComercio) precioComercio = precioNormal;

//         todasFilas.push({
//           EAN: ean,
//           Producto: cells[0]?.innerText.trim() || "",
//           Lista: limpiarNumero(cells[3]?.innerText),
//           PrecioNormal: limpiarNumero(cells[4]?.innerText),
//           "PRECIO COMERCIO C/IVA": precioComercio,
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

//     const filasFiltradas = Object.values(
//       todasFilas.reduce((acc, fila, idx) => {
//         const ean = fila.EAN || `SIN_EAN_${idx}`;
//         const descActual = parseFloat(fila.Descuento) || 0;
//         const descGuardado = acc[ean]
//           ? parseFloat(acc[ean].Descuento) || 0
//           : -1;
//         if (!acc[ean] || descActual > descGuardado) acc[ean] = fila;
//         return acc;
//       }, {})
//     );

//     const ws = XLSX.utils.json_to_sheet(filasFiltradas);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Cofarsur");
//     XLSX.writeFile(wb, "cofarsur.xlsx");
//   };
const exportarExcel = () => {
  let todasFilas = [];

  tablasHtml.forEach((html) => {
    if (!html) return;
    const div = document.createElement("div");
    div.innerHTML = html;
    const rows = div.querySelectorAll("tbody tr");

    Array.from(rows).forEach((row) => {
      const cells = row.querySelectorAll("td");

      const desc = row.getAttribute("data-small-description") || "";
      const codigoMatch = desc.match(/Cód\. de barra:<\/strong>\s*([\d]+)/);
      const ean = codigoMatch ? codigoMatch[1] : "";

      const promo = !!row.querySelector('img[src*="icon_cart"]');

      const precioNormal = limpiarNumero(cells[4]?.innerText);
      let precioComercio = limpiarNumero(cells[5]?.innerText);

      // Si PRECIO COMERCIO C/IVA está vacío o 0, usamos PrecioNormal
      if (!precioComercio) precioComercio = precioNormal;

      // 🔎 Stock: si hay img.fact_disponible → NO hay stock
      let stock = "DESCONOCIDO";
      const tdDescripcion = cells[0];
      if (tdDescripcion) {
        const imgStock = tdDescripcion.querySelector("img.fact_disponible");
        if (imgStock) {
          stock = "NO"; // sin stock
        } else {
          stock = "SI"; // disponible
        }
      }

      todasFilas.push({
        EAN: ean,
        Producto: cells[0]?.innerText.trim() || "",
        Lista: limpiarNumero(cells[3]?.innerText),
        PrecioNormal: limpiarNumero(cells[4]?.innerText),
        "PRECIO COMERCIO C/IVA": precioComercio,
        Descuento: limpiarDescuento(cells[6]?.innerText),
        Promo: promo ? "SI" : "NO",
        Stock: stock, // ✅ ahora "SI" o "NO"
      });
    });
  });

  if (todasFilas.length === 0) {
    alert("No se encontraron filas para exportar");
    return;
  }

  const filasFiltradas = Object.values(
    todasFilas.reduce((acc, fila, idx) => {
      const ean = fila.EAN || `SIN_EAN_${idx}`;
      const descActual = parseFloat(fila.Descuento) || 0;
      const descGuardado = acc[ean]
        ? parseFloat(acc[ean].Descuento) || 0
        : -1;
      if (!acc[ean] || descActual > descGuardado) acc[ean] = fila;
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
      {/* ✅ NUEVO INPUT PARA SUBIR VARIOS TXT */}
      <label style={{ fontWeight: 600 }}>
        Subir tablas desde archivos (.txt)
      </label>
      <input type="file" accept=".txt" multiple onChange={handleTablasUpload} />
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
        Cada archivo debe contener el HTML de la tabla, como el que copiás del
        navegador.
      </div>

      {/* ✅ OPCIÓN ORIGINAL: PEGAR MANUALMENTE */}
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
