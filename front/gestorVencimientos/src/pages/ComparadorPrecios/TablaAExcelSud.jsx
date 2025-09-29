// import React, { useState } from "react";
// import * as XLSX from "xlsx";

// export default function TablaAExcelSud() {
//   const [tablasHtml, setTablasHtml] = useState([""]);
//   const [txtContenido, setTxtContenido] = useState("");
//   const [mapaEAN, setMapaEAN] = useState({}); // nombre_normalizado -> EAN13

//   // -------- utils --------
//   const normalizarNombre = (s = "") =>
//     String(s)
//       .toUpperCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/\s+/g, " ")
//       .trim();

//   const extraerNombreDesdeTxt = (linea) => {
//     if (!linea || linea.length <= 19) return "";
//     const resto = linea.slice(19); // desde char 20 (idx 19)
//     // nombre hasta 2+ espacios
//     const m = resto.match(/^(.*?)(\s{2,}|$)/);
//     return m ? m[1].trim() : resto.trim();
//   };

// //   const extraerEANDesdeTxt = (linea) => {
// //     if (!linea) return "";
// //     // Buscar tokens con prefijo primero
// //     const prefijo = linea.match(/\b(?:HE|UC|Z)\s*(\d{12,14})\b/);
// //     let digitos = "";
// //     if (prefijo) {
// //       digitos = prefijo[1];
// //     } else {
// //       // fallback: cualquier secuencia de 13-14 dígitos
// //       const sinPref = linea.match(/\b(\d{13,14})\b/);
// //       if (sinPref) digitos = sinPref[1];
// //     }
// //     if (!digitos) return "";
// //     // Quedarme con los últimos 13 dígitos
// //     if (digitos.length > 13) digitos = digitos.slice(-13);
// //     return digitos;

// //   };

// const extraerEANDesdeTxt = (linea) => {
//   if (!linea) return "";

//   // 1️⃣ Buscar primero HE/UC/Z seguido de 12-14 dígitos, pegado o con espacio
//   const prefijo = linea.match(/(?:HE|UC|Z)(\d{12,14})/);
//   if (prefijo) {
//     let digitos = prefijo[1];
//     if (digitos.length > 13) digitos = digitos.slice(-13);
//     return digitos;
//   }

//   // 2️⃣ Si no, cualquier secuencia de 13-14 dígitos
//   const sinPref = linea.match(/(\d{13,14})/);
//   if (sinPref) {
//     let digitos = sinPref[1];
//     if (digitos.length > 13) digitos = digitos.slice(-13);
//     return digitos;
//   }

//   return "";
// };



//   const parsearImporteSud = (raw) => {
//     if (raw == null) return "";
//     // raw puede venir como "$3.725,00" o "3.725,00"
//     let txt = String(raw).replace(/\s+/g, "");
//     txt = txt.replace(/\$/g, "");
//     // quitar puntos de miles
//     txt = txt.replace(/\./g, "");
//     // usar punto decimal
//     txt = txt.replace(/,/g, ".");
//     const n = parseFloat(txt);
//     if (Number.isNaN(n)) return "";
//     // Devolvemos string con dos decimales (excel lo lee bien como número)
//     return n.toFixed(2);
//   };

//   const getTextoCelda = (td) =>
//     td ? td.innerText || td.textContent || "" : "";

//   const getPrecioDesdeTd = (td) => {
//     if (!td) return "";
//     // En Sud los importes están en <span class="amounts">$3.725,<sup>00</sup></span>
//     // innerText debería dar "$3.725,00"
//     const txt = td.innerText || td.textContent || "";
//     return parsearImporteSud(txt);
//   };

//   // -------- handlers --------
//   const handleChangeTabla = (idx, value) => {
//     const nuevas = [...tablasHtml];
//     nuevas[idx] = value;
//     setTablasHtml(nuevas);
//   };

//   const agregarTextarea = () => setTablasHtml((prev) => [...prev, ""]);

//   const handleTxtUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const contenido = String(ev.target.result || "");
//       setTxtContenido(contenido);

//       const mapa = {};
//       const lineas = contenido
//         .split(/\r?\n/)
//         .map((l) => l.trimEnd())
//         .filter(Boolean);
//       lineas.forEach((linea) => {
//         const nombre = extraerNombreDesdeTxt(linea);
//         const ean = extraerEANDesdeTxt(linea);
//         if (nombre && ean) {
//           mapa[normalizarNombre(nombre)] = ean;
//         }
//       });
//       setMapaEAN(mapa);
//       console.log("TXT parseado. Registros EAN:", Object.keys(mapa).length);
//     };
//     reader.readAsText(file, "utf-8");
//   };

//   const exportarExcel = () => {
//     if (tablasHtml.every((t) => !t)) {
//       alert("Pegá al menos una tabla HTML de Sud.");
//       return;
//     }
//     if (!txtContenido || Object.keys(mapaEAN).length === 0) {
//       if (
//         !confirm(
//           "No se cargó el .txt o no se detectaron EAN. ¿Continuar sin códigos?"
//         )
//       ) {
//         return;
//       }
//     }

//     const todasFilas = [];

//     tablasHtml.forEach((html) => {
//       if (!html) return;

//       const div = document.createElement("div");
//       div.innerHTML = html;

//       const rows = div.querySelectorAll("tbody tr");
//       Array.from(rows).forEach((row) => {
//         const celdas = row.querySelectorAll("td");
//         if (!celdas || celdas.length === 0) return;

//         // Producto (1ra columna)
//         // En Sud suele estar en .product-name dentro de la primera celda
//         const nombreDet =
//           row.querySelector(".product-name")?.textContent ||
//           getTextoCelda(celdas[0]);
//         const producto = (nombreDet || "").trim();

//         // PVP (col 4) → Lista
//         const lista = getPrecioDesdeTd(celdas[3]);
//         // PRECIO C/DESC. (col 5) → PrecioOferta
//         const precioOferta = getPrecioDesdeTd(celdas[4]);
//         // DTO./PVP (col 6) → Descuento (dejamos como viene, ej "33,20%")
//         const descuento = (getTextoCelda(celdas[5]) || "").trim();

//         // Promo: “SI” si hay etiqueta transfer en la fila
//         const promo = row.querySelector(".transfer-tag") ? "SI" : "NO";

//         // Buscar EAN por nombre
//         const ean =
//           mapaEAN[normalizarNombre(producto)] || "Codigo no encontrado";

//         // Construir fila final
//         todasFilas.push({
//           CodigoBarras: ean,
//           Producto: producto,
//           Lista: lista,
//           PrecioNormal: "", // pedido: vacío
//           PrecioOferta: precioOferta,
//           Descuento: descuento,
//           Promo: promo,
//           Stock: "", // pedido: no usar por ahora
//         });
//       });
//     });

//     if (todasFilas.length === 0) {
//       alert("No se encontraron filas para exportar.");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(todasFilas);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sud");
//     XLSX.writeFile(wb, "delSud.xlsx");
//   };

//   return (
//     <div style={{ padding: 16, display: "grid", gap: 12 }}>
//       <div>
//         <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
//           Maestro (.txt) con nombres y códigos de barras
//         </label>
//         <input type="file" accept=".txt" onChange={handleTxtUpload} />
//         <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
//           Se extrae el nombre desde el carácter 20 hasta 2+ espacios. Se busca
//           HE/UC/Z + dígitos o secuencias de 13-14 dígitos y se conservan los
//           últimos 13.
//         </div>
//       </div>

//       {tablasHtml.map((tabla, idx) => (
//         <textarea
//           key={idx}
//           style={{ width: "100%", height: 200, marginBottom: 8 }}
//           placeholder={`Pega aquí el HTML de la tabla Sud #${idx + 1}`}
//           value={tabla}
//           onChange={(e) => handleChangeTabla(idx, e.target.value)}
//         />
//       ))}

//       <div style={{ display: "flex", gap: 8 }}>
//         <button onClick={agregarTextarea}>Agregar otra tabla</button>
//         <button onClick={exportarExcel}>Descargar Excel</button>
//       </div>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import * as XLSX from "xlsx";

// export default function TablaAExcelSud() {
//   const [tablasHtml, setTablasHtml] = useState([""]);
//   const [txtContenido, setTxtContenido] = useState("");
//   const [mapaEAN, setMapaEAN] = useState({}); // nombre_normalizado -> EAN13

//   // -------- utils --------
//   const normalizarNombre = (s = "") =>
//     String(s)
//       .toUpperCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/\s+/g, " ")
//       .trim();

//   const extraerNombreDesdeTxt = (linea) => {
//     if (!linea || linea.length <= 19) return "";
//     const resto = linea.slice(19); // desde char 20 (idx 19)
//     // nombre hasta 2+ espacios
//     const m = resto.match(/^(.*?)(\s{2,}|$)/);
//     return m ? m[1].trim() : resto.trim();
//   };

// //   const extraerEANDesdeTxt = (linea) => {
// //     if (!linea) return "";
// //     // Buscar tokens con prefijo primero
// //     const prefijo = linea.match(/\b(?:HE|UC|Z)\s*(\d{12,14})\b/);
// //     let digitos = "";
// //     if (prefijo) {
// //       digitos = prefijo[1];
// //     } else {
// //       // fallback: cualquier secuencia de 13-14 dígitos
// //       const sinPref = linea.match(/\b(\d{13,14})\b/);
// //       if (sinPref) digitos = sinPref[1];
// //     }
// //     if (!digitos) return "";
// //     // Quedarme con los últimos 13 dígitos
// //     if (digitos.length > 13) digitos = digitos.slice(-13);
// //     return digitos;

// //   };

// const extraerEANDesdeTxt = (linea) => {
//   if (!linea) return "";

//   // 1️⃣ Buscar primero HE/UC/Z seguido de 12-14 dígitos, pegado o con espacio
//   const prefijo = linea.match(/(?:HE|UC|Z)(\d{12,14})/);
//   if (prefijo) {
//     let digitos = prefijo[1];
//     if (digitos.length > 13) digitos = digitos.slice(-13);
//     return digitos;
//   }

//   // 2️⃣ Si no, cualquier secuencia de 13-14 dígitos
//   const sinPref = linea.match(/(\d{13,14})/);
//   if (sinPref) {
//     let digitos = sinPref[1];
//     if (digitos.length > 13) digitos = digitos.slice(-13);
//     return digitos;
//   }

//   return "";
// };



//   const parsearImporteSud = (raw) => {
//     if (raw == null) return "";
//     // raw puede venir como "$3.725,00" o "3.725,00"
//     let txt = String(raw).replace(/\s+/g, "");
//     txt = txt.replace(/\$/g, "");
//     // quitar puntos de miles
//     txt = txt.replace(/\./g, "");
//     // usar punto decimal
//     txt = txt.replace(/,/g, ".");
//     const n = parseFloat(txt);
//     if (Number.isNaN(n)) return "";
//     // Devolvemos string con dos decimales (excel lo lee bien como número)
//     return n.toFixed(2);
//   };

//   const getTextoCelda = (td) =>
//     td ? td.innerText || td.textContent || "" : "";

//   const getPrecioDesdeTd = (td) => {
//     if (!td) return "";
//     // En Sud los importes están en <span class="amounts">$3.725,<sup>00</sup></span>
//     // innerText debería dar "$3.725,00"
//     const txt = td.innerText || td.textContent || "";
//     return parsearImporteSud(txt);
//   };

//   // -------- handlers --------
//   const handleChangeTabla = (idx, value) => {
//     const nuevas = [...tablasHtml];
//     nuevas[idx] = value;
//     setTablasHtml(nuevas);
//   };

//   const agregarTextarea = () => setTablasHtml((prev) => [...prev, ""]);

//   const handleTxtUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const contenido = String(ev.target.result || "");
//       setTxtContenido(contenido);

//       const mapa = {};
//       const lineas = contenido
//         .split(/\r?\n/)
//         .map((l) => l.trimEnd())
//         .filter(Boolean);
//       lineas.forEach((linea) => {
//         const nombre = extraerNombreDesdeTxt(linea);
//         const ean = extraerEANDesdeTxt(linea);
//         if (nombre && ean) {
//           mapa[normalizarNombre(nombre)] = ean;
//         }
//       });
//       setMapaEAN(mapa);
//       console.log("TXT parseado. Registros EAN:", Object.keys(mapa).length);
//     };
//     reader.readAsText(file, "utf-8");
//   };

//   const exportarExcel = () => {
//     if (tablasHtml.every((t) => !t)) {
//       alert("Pegá al menos una tabla HTML de Sud.");
//       return;
//     }
//     if (!txtContenido || Object.keys(mapaEAN).length === 0) {
//       if (
//         !confirm(
//           "No se cargó el .txt o no se detectaron EAN. ¿Continuar sin códigos?"
//         )
//       ) {
//         return;
//       }
//     }

//     const todasFilas = [];

//     tablasHtml.forEach((html) => {
//       if (!html) return;

//       const div = document.createElement("div");
//       div.innerHTML = html;

//       const rows = div.querySelectorAll("tbody tr");
//       Array.from(rows).forEach((row) => {
//         const celdas = row.querySelectorAll("td");
//         if (!celdas || celdas.length === 0) return;

//         // Producto (1ra columna)
//         // En Sud suele estar en .product-name dentro de la primera celda
//         const nombreDet =
//           row.querySelector(".product-name")?.textContent ||
//           getTextoCelda(celdas[0]);
//         const producto = (nombreDet || "").trim();

//         // PVP (col 4) → Lista
//         const lista = getPrecioDesdeTd(celdas[3]);
//         // PRECIO C/DESC. (col 5) → PrecioOferta
//         const precioOferta = getPrecioDesdeTd(celdas[4]);
//         // DTO./PVP (col 6) → Descuento (dejamos como viene, ej "33,20%")
//         const descuento = (getTextoCelda(celdas[5]) || "").trim();

//         // Promo: “SI” si hay etiqueta transfer en la fila
//         const promo = row.querySelector(".transfer-tag") ? "SI" : "NO";

//         // Buscar EAN por nombre
//         const ean =
//           mapaEAN[normalizarNombre(producto)] || "Codigo no encontrado";

//         // Construir fila final
//         todasFilas.push({
//           CodigoBarras: ean,
//           Producto: producto,
//           Lista: lista,
//           PrecioNormal: "", // pedido: vacío
//           PrecioOferta: precioOferta,
//           Descuento: descuento,
//           Promo: promo,
//           Stock: "", // pedido: no usar por ahora
//         });
//       });
//     });

//     if (todasFilas.length === 0) {
//       alert("No se encontraron filas para exportar.");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(todasFilas);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sud");
//     XLSX.writeFile(wb, "delSud.xlsx");
//   };

//   return (
//     <div style={{ padding: 16, display: "grid", gap: 12 }}>
//       <div>
//         <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
//           Maestro (.txt) con nombres y códigos de barras
//         </label>
//         <input type="file" accept=".txt" onChange={handleTxtUpload} />
//         <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
//           Se extrae el nombre desde el carácter 20 hasta 2+ espacios. Se busca
//           HE/UC/Z + dígitos o secuencias de 13-14 dígitos y se conservan los
//           últimos 13.
//         </div>
//       </div>

//       {tablasHtml.map((tabla, idx) => (
//         <textarea
//           key={idx}
//           style={{ width: "100%", height: 200, marginBottom: 8 }}
//           placeholder={`Pega aquí el HTML de la tabla Sud #${idx + 1}`}
//           value={tabla}
//           onChange={(e) => handleChangeTabla(idx, e.target.value)}
//         />
//       ))}

//       <div style={{ display: "flex", gap: 8 }}>
//         <button onClick={agregarTextarea}>Agregar otra tabla</button>
//         <button onClick={exportarExcel}>Descargar Excel</button>
//       </div>
//     </div>
//   );
// }


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

//   let match;

//   // 1️⃣ Prefijos conocidos HE/UC/Z + 12-14 dígitos, con o sin espacio
//   match = linea.match(/(?:HE|UC|Z4)\s*(\d{12,14})/i);
//   let digitos;
//   if (match) {
//     digitos = match[1];
//   } else {
//     // 2️⃣ Buscar cualquier secuencia de 13-14 dígitos
//     match = linea.match(/\d{13,14}/);
//     if (match) digitos = match[0];
//   }

//   if (!digitos) return "";

//   // 3️⃣ Descartar los 2 primeros dígitos
//   if (digitos.length > 2) digitos = digitos.slice(2);

//   // 4️⃣ Limitar a 13 dígitos
//   if (digitos.length > 13) digitos = digitos.slice(-13);

//   return digitos;
// };

const extraerEANDesdeTxt = (linea) => {
  if (!linea) return "";

  // 1️⃣ Buscar HE / UC / Z / IC con o sin espacio
  let match = linea.match(/(?:HE|UC|Z4|IC)\s*(\d{12,14})/i);
  if (match) {
    let digitos = match[1];
    if (digitos.length > 2) digitos = digitos.slice(0, 13); // NO descarto primeros dos si es un EAN estándar
    return digitos;
  }

  // 2️⃣ Si no hay prefijo, buscar primer grupo de 13-14 dígitos consecutivos
  match = linea.match(/\d{13,14}/);
  if (match) {
    let digitos = match[0];
    // descartar primeros 2 si este caso es realmente un código no prefijado
    if (digitos.length > 2) digitos = digitos.slice(2);
    if (digitos.length > 13) digitos = digitos.slice(-13);
    return digitos;
  }

  return "";
};



  const parsearImporteSud = (raw) => {
    if (raw == null) return "";
    let txt = String(raw).replace(/\s+/g, "").replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ".");
    const n = parseFloat(txt);
    if (Number.isNaN(n)) return "";
    return n.toFixed(2);
  };

  const getTextoCelda = (td) => td ? td.innerText || td.textContent || "" : "";
  const getPrecioDesdeTd = (td) => td ? parsearImporteSud(td.innerText || td.textContent || "") : "";

  // -------- handlers --------
  const handleChangeTabla = (idx, value) => {
    const nuevas = [...tablasHtml];
    nuevas[idx] = value;
    setTablasHtml(nuevas);
  };

  const agregarTextarea = () => setTablasHtml(prev => [...prev, ""]);

  const handleTxtUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const contenido = String(ev.target.result || "");
      setTxtContenido(contenido);

      const mapa = {};
      const lineas = contenido.split(/\r?\n/).map(l => l.trimEnd()).filter(Boolean);
      lineas.forEach(linea => {
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

  const exportarExcel = () => {
    if (tablasHtml.every(t => !t)) {
      alert("Pegá al menos una tabla HTML de Sud.");
      return;
    }
    if (!txtContenido || Object.keys(mapaEAN).length === 0) {
      if (!confirm("No se cargó el .txt o no se detectaron EAN. ¿Continuar sin códigos?")) return;
    }

    const todasFilas = [];
    tablasHtml.forEach(html => {
      if (!html) return;
      const div = document.createElement("div");
      div.innerHTML = html;
      const rows = div.querySelectorAll("tbody tr");
      Array.from(rows).forEach(row => {
        const celdas = row.querySelectorAll("td");
        if (!celdas || celdas.length === 0) return;
        const nombreDet = row.querySelector(".product-name")?.textContent || getTextoCelda(celdas[0]);
        const producto = (nombreDet || "").trim();
        const lista = getPrecioDesdeTd(celdas[3]);
        const precioOferta = getPrecioDesdeTd(celdas[4]);
        const descuento = (getTextoCelda(celdas[5]) || "").trim();
        const promo = row.querySelector(".transfer-tag") ? "SI" : "NO";
        const ean = mapaEAN[normalizarNombre(producto)] || "Codigo no encontrado";
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
          Se extrae el nombre desde el carácter 20 hasta 2+ espacios. Se busca HE/UC/Z + dígitos o secuencias de 13 dígitos y se conservan los primeros 13.
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
