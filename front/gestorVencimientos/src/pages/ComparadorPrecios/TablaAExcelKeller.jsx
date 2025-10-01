import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function TablaAExcelKeller() {
  const [tablasHtml, setTablasHtml] = useState([""]);
  const [mapaEAN, setMapaEAN] = useState({});

  // -------- utils --------
  const normalizarNombre = (s = "") =>
    String(s)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const parsearImporte = (raw) => {
    if (!raw) return "";
    let txt = String(raw)
      .replace(/\s+/g, "")
      .replace(/\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const n = parseFloat(txt);
    return Number.isNaN(n) ? "" : n.toFixed(2);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const contenido = ev.target.result;
      const lineas = contenido.split(/\r?\n/).filter(Boolean);
      const mapa = {};
      lineas.forEach((linea) => {
        const cols = linea.split(";");
        if (cols.length >= 5) {
          const nombre = normalizarNombre(cols[1]);
          const ean = cols[4];
          if (nombre && ean) mapa[nombre] = ean;
        }
      });
      setMapaEAN(mapa);
      console.log("CSV Keller parseado. Registros:", Object.keys(mapa).length);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleTablasUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTablasHtml((prev) => [...prev, String(ev.target.result || "")]);
      };
      reader.readAsText(file, "utf-8");
    });
  };

  const exportarExcel = () => {
    const todasFilas = [];
    const TITULOS_IGNORAR = [
      "PRODUCTO",
      "HABITUAL",
      "TRANSFER",
      "% PVP",
      "CBA",
      "CC",
    ];

    tablasHtml.forEach((html) => {
      if (!html) return;
      const div = document.createElement("div");
      div.innerHTML = html;
      const rows = div.querySelectorAll("tbody tr");

      Array.from(rows).forEach((row) => {
        const celdas = row.querySelectorAll("td");
        if (!celdas || celdas.length === 0) return;

        // Nombre de producto: solo nodos de texto directos, quitando +IVA y TRF
        const tdProducto = celdas[0];
        let producto = "";
        tdProducto.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) producto += node.textContent;
        });
        producto = producto.replace(/\+IVA|TRF/gi, "").trim();

        // Ignorar filas de cabecera o vacías
        if (!producto || TITULOS_IGNORAR.includes(producto.toUpperCase()))
          return;

        const precioHabitual = parsearImporte(celdas[2]?.innerText || "");

        // Precio Transfer: tercer div dentro de la cuarta td
        let transferPrecio = "";
        const tdTransfer = celdas[3];
        if (tdTransfer) {
          const divs = tdTransfer.querySelectorAll("div");
          divs.forEach((d) => {
            if (!transferPrecio) {
              const txt = d.textContent || "";
              if (txt.includes("$")) {
                transferPrecio = parsearImporte(txt);
              }
            }
          });
        }

        // Si no hay precio de transfer, usar el habitual
        const tieneTransfer = !!transferPrecio;
        if (!tieneTransfer) transferPrecio = precioHabitual;

        // Stock
        let stock = "NO";
        const stockDiv = celdas[5]?.querySelector(".pt_stock");
        if (stockDiv) stock = "SI";

        // EAN desde CSV
        const ean =
          mapaEAN[normalizarNombre(producto)] || "Codigo no encontrado";

        todasFilas.push({
          EAN: ean,
          Producto: producto,
          PrecioHabitual: precioHabitual,
          Transfer: tieneTransfer ? "SI" : "NO",
          "Precio Transfer": transferPrecio,
          Stock: stock,
        });
      });
    });

    if (todasFilas.length === 0) {
      alert("No se encontraron filas en Keller.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(todasFilas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Keller");
    XLSX.writeFile(wb, "Keller.xlsx");
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div>
        <label>
          CSV Keller (con nombres y códigos de barras)
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
        </label>
      </div>

      <div>
        <label>
          Tablas Keller (.txt con HTML)
          <input
            type="file"
            accept=".txt"
            multiple
            onChange={handleTablasUpload}
          />
        </label>
      </div>

      {tablasHtml.map((tabla, idx) => (
        <textarea
          key={idx}
          style={{ width: "100%", height: 200 }}
          placeholder={`Pega aquí el HTML Keller #${idx + 1}`}
          value={tabla}
          onChange={(e) => {
            const nuevas = [...tablasHtml];
            nuevas[idx] = e.target.value;
            setTablasHtml(nuevas);
          }}
        />
      ))}

      <button onClick={exportarExcel}>Descargar Excel Keller</button>
    </div>
  );
}
