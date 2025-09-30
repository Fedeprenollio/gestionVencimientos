import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function TablaAExcelSud() {
  const [tablasHtml, setTablasHtml] = useState([""]);
  const [txtContenido, setTxtContenido] = useState("");
  const [mapaEAN, setMapaEAN] = useState({}); // nombre_normalizado -> EAN13

  // -------- utils --------
  const normalizarNombre = (s = "") =>
    String(s)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const extraerNombreDesdeTxt = (linea) => {
    if (!linea || linea.length <= 19) return "";
    let resto = linea.slice(19, 19 + 40); // hasta 40 caracteres máximo
    return resto.trim();
  };
  // -------- CORREGIDO --------

  // const extraerEANDesdeTxt = (linea) => {
  //   if (!linea) return "";

  //   // 1️⃣ Buscar HE / UC / Z / IC con o sin espacio
  //   let match = linea.match(/(?:HE|UC|Z4|IC|HK)\s*(\d{12,14})/i);
  //   if (match) {
  //     let digitos = match[1];
  //     if (digitos.length > 2) digitos = digitos.slice(0, 13); // NO descarto primeros dos si es un EAN estándar
  //     return digitos;
  //   }

  //   // 2️⃣ Si no hay prefijo, buscar primer grupo de 13-14 dígitos consecutivos
  //   match = linea.match(/\d{13,14}/);
  //   if (match) {
  //     let digitos = match[0];
  //     // descartar primeros 2 si este caso es realmente un código no prefijado
  //     if (digitos.length > 2) digitos = digitos.slice(2);
  //     if (digitos.length > 13) digitos = digitos.slice(-13);
  //     return digitos;
  //   }

  //   return "";
  // };

  const extraerEANDesdeTxt = (linea) => {
    if (!linea) return "";

    // 1️⃣ Caso especial: HK con 8 dígitos
    let match = linea.match(/HK\s*(\d{8})/i);
    if (match) {
      return match[1]; // no tocamos nada, lo devolvemos tal cual
    }

    // 2️⃣ Buscar HE / UC / Z4 / IC con 12-14 dígitos
    match = linea.match(/(?:HE|UC|Z4|IC)\s*(\d{12,14})/i);
    if (match) {
      let digitos = match[1];
      if (digitos.length > 13) digitos = digitos.slice(-13);
      return digitos;
    }

    // 3️⃣ Si no hay prefijo, buscar primer grupo de 13-14 dígitos consecutivos
    match = linea.match(/\d{13,14}/);
    if (match) {
      let digitos = match[0];
      // descartar los primeros 2 si no tiene prefijo (códigos internos)
      if (digitos.length > 2) digitos = digitos.slice(2);
      if (digitos.length > 13) digitos = digitos.slice(-13);
      return digitos;
    }

    return "";
  };

  const parsearImporteSud = (raw) => {
    if (raw == null) return "";
    let txt = String(raw)
      .replace(/\s+/g, "")
      .replace(/\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const n = parseFloat(txt);
    if (Number.isNaN(n)) return "";
    return n.toFixed(2);
  };

  const getTextoCelda = (td) =>
    td ? td.innerText || td.textContent || "" : "";
  const getPrecioDesdeTd = (td) =>
    td ? parsearImporteSud(td.innerText || td.textContent || "") : "";

  // -------- handlers --------
  const handleChangeTabla = (idx, value) => {
    const nuevas = [...tablasHtml];
    nuevas[idx] = value;
    setTablasHtml(nuevas);
  };

  const agregarTextarea = () => setTablasHtml((prev) => [...prev, ""]);

  const handleTxtUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const contenido = String(ev.target.result || "");
      setTxtContenido(contenido);

      const mapa = {};
      const lineas = contenido
        .split(/\r?\n/)
        .map((l) => l.trimEnd())
        .filter(Boolean);
      lineas.forEach((linea) => {
        const nombre = extraerNombreDesdeTxt(linea);
        const ean = extraerEANDesdeTxt(linea);

        if (nombre && ean) {
          mapa[normalizarNombre(nombre)] = ean;
        }
      });
      setMapaEAN(mapa);
      console.log("TXT parseado. Registros EAN:", Object.keys(mapa).length);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleTablasUpload = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const contenido = String(ev.target.result || "");
      setTablasHtml((prev) => [...prev, contenido]); // se comporta como si hubieras pegado HTML
    };
    reader.readAsText(file, "utf-8");
  });
};


  const exportarExcel = () => {
    if (tablasHtml.every((t) => !t)) {
      alert("Pegá al menos una tabla HTML de Sud.");
      return;
    }
    if (!txtContenido || Object.keys(mapaEAN).length === 0) {
      if (
        !confirm(
          "No se cargó el .txt o no se detectaron EAN. ¿Continuar sin códigos?"
        )
      )
        return;
    }

    const todasFilas = [];
    tablasHtml.forEach((html) => {
      if (!html) return;
      const div = document.createElement("div");
      div.innerHTML = html;
      const rows = div.querySelectorAll("tbody tr");
      Array.from(rows).forEach((row) => {
        const celdas = row.querySelectorAll("td");
        if (!celdas || celdas.length === 0) return;
        const nombreDet =
          row.querySelector(".product-name")?.textContent ||
          getTextoCelda(celdas[0]);
        const producto = (nombreDet || "").trim();
        const lista = getPrecioDesdeTd(celdas[3]);
        const precioOferta = getPrecioDesdeTd(celdas[4]);
        const descuento = (getTextoCelda(celdas[5]) || "").trim();
        const promo = row.querySelector(".transfer-tag") ? "SI" : "NO";
        const ean =
          mapaEAN[normalizarNombre(producto)] || "Codigo no encontrado";
        todasFilas.push({
          Ean: ean,
          Producto: producto,
          Lista: lista,
          PrecioNormal: "",
          "Precio Final (sin IVA)": precioOferta,
          Descuento: descuento,
          Promo: promo,
          Stock: "",
        });
      });
    });

    if (todasFilas.length === 0) {
      alert("No se encontraron filas para exportar.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(todasFilas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sud");
    XLSX.writeFile(wb, "delSud.xlsx");
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Maestro (.txt) con nombres y códigos de barras
        </label>
        <input type="file" accept=".txt" onChange={handleTxtUpload} />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          Se extrae el nombre desde el carácter 20 hasta 2+ espacios. Se busca
          HE/UC/Z + dígitos o secuencias de 13 dígitos y se conservan los
          primeros 13.
        </div>
      </div>

      {/* ✅ NUEVA SECCIÓN PARA SUBIR MULTIPLES TABLAS */}
      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Tablas Sud (.txt) con HTML — opción subir múltiples archivos
        </label>
        <input
          type="file"
          accept=".txt"
          multiple
          onChange={handleTablasUpload}
        />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          Cada archivo se interpretará como una tabla Sud. El primero define
          encabezados, los siguientes agregan filas.
        </div>
      </div>

      {tablasHtml.map((tabla, idx) => (
        <textarea
          key={idx}
          style={{ width: "100%", height: 200, marginBottom: 8 }}
          placeholder={`Pega aquí el HTML de la tabla Sud #${idx + 1}`}
          value={tabla}
          onChange={(e) => handleChangeTabla(idx, e.target.value)}
        />
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={agregarTextarea}>Agregar otra tabla</button>
        <button onClick={exportarExcel}>Descargar Excel</button>
      </div>
    </div>
  );
}
