import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";

import { DataGrid } from "@mui/x-data-grid";
import { Button, Alert } from "@mui/material";
import solver from "javascript-lp-solver";

function parseExcelNumber(raw) {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return 0;
  let cleaned = raw.replace(/\$/g, "").trim();
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  return parseFloat(cleaned) || 0;
}

export default function ComparadorPrecios() {
  const [planCompra, setPlanCompra] = useState([]);
  const [preciosProveedores, setPreciosProveedores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [errorSolver, setErrorSolver] = useState("");
  const [faltantes, setFaltantes] = useState([]);

  function buscarProveedor(preciosProv, aliases) {
    for (let code of aliases) {
      if (preciosProv[code]) return preciosProv[code];
    }
    return {};
  }

  // --- Exportar faltantes a Excel ---
  const exportFaltantes = () => {
    if (!faltantes.length) return;

    const dataToExport = faltantes.map((f) => ({
      EAN: f.ean,
      Producto: f.producto,
      Proveedor: f.proveedor,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NoEncontrados");
    XLSX.writeFile(wb, "ProductosNoEncontrados.xlsx");
  };

  // --- Exportar plan optimizado a Excel (con styling xlsx-js-style) ---
  // const exportToExcel = () => {
  //   if (!rows.length) return;

  //   // Preparar datos (incluye sinStock por proveedor)
  //   const dataToExport = rows.map((row) => {
  //     const proveedoresData = Object.keys(preciosProveedores).map((prov) => {
  //       const provDataGlobal = buscarProveedor(preciosProveedores[prov] || {}, [
  //         row.ean,
  //       ]);
  //       return {
  //         prov,
  //         unidades: row[prov] || 0,
  //         precio: row[`${prov}_precio_unit`] || 0,
  //         total: row[`costo_${prov}_num`] || 0,
  //         sinStock: !!provDataGlobal?.sinStock,
  //       };
  //     });
  //     // precioMinimo entre los que tienen stock y precio>0
  //     const preciosConStock = proveedoresData
  //       .filter((p) => p.precio > 0 && !p.sinStock)
  //       .map((p) => p.precio);
  //     const precioMinimo = preciosConStock.length
  //       ? Math.min(...preciosConStock)
  //       : 0;

  //     return {
  //       EAN: row.ean,
  //       Producto: row.producto,
  //       Minimo: row.minimo,
  //       Maximo: row.maximo,
  //       proveedoresData,
  //       precioMinimo,
  //     };
  //   });

  //   // Crear workbook y sheet
  //   const wb = XLSX.utils.book_new();
  //   const wsData = [];

  //   // Cabecera
  //   const header = ["EAN", "Producto", "Minimo", "Maximo"];
  //   Object.keys(preciosProveedores).forEach((prov) => {
  //     header.push(`${prov} (unidades)`, `${prov} $/unidad`, `${prov} total`);
  //   });
  //   wsData.push(header);

  //   // Filas
  //   dataToExport.forEach((fila) => {
  //     const row = [fila.EAN, fila.Producto, fila.Minimo, fila.Maximo];
  //     Object.keys(preciosProveedores).forEach((prov) => {
  //       const p = fila.proveedoresData.find((x) => x.prov === prov);
  //       if (p) {
  //         row.push(p.unidades, p.precio, p.total);
  //       } else {
  //         row.push(0, 0, 0);
  //       }
  //     });
  //     wsData.push(row);
  //   });

  //   const ws = XLSX.utils.aoa_to_sheet(wsData);

  //   // Estilos:
  //   // - Si proveedor está sinStock -> fondo rojo + fuente verde (bold)
  //   // - Entre los que tienen stock, marcar mejor y segundo mejor precio en fuente verde (bold), sin relleno
  //   for (let r = 1; r < wsData.length; r++) {
  //     const fila = dataToExport[r - 1];

  //     // construir array de precios con stock (para determinar 1° y 2°)
  //     const preciosValidados = []; // { precio, provIndex, cellRef }
  //     Object.keys(preciosProveedores).forEach((prov, i) => {
  //       const colPrecio = 4 + i * 3 + 1; // columna de precio unitario
  //       const cellRef = XLSX.utils.encode_cell({ r, c: colPrecio });
  //       if (!ws[cellRef]) return;
  //       const precio = parseFloat(wsData[r][colPrecio]) || 0;

  //       const provData = fila.proveedoresData.find((x) => x.prov === prov);
  //       const sinStock = provData?.sinStock;

  //       if (sinStock) {
  //         // marcar como sin stock: fondo rojo + fuente verde
  //         ws[cellRef].s = {
  //           fill: { fgColor: { rgb: "FFCCCC" } }, // rojo claro
  //           font: { color: { rgb: "006100" }, bold: true },
  //         };
  //       } else {
  //         // precios que sí tienen stock y precio>0 se consideran para ranking
  //         if (precio > 0) {
  //           preciosValidados.push({ precio, cellRef });
  //         } else {
  //           // no hay precio -> dejar neutro
  //         }
  //       }
  //     });

  //     // ordenar validados por precio asc
  //     preciosValidados.sort((a, b) => a.precio - b.precio);

  //     // marcar mejor y segundo mejor (si existen): fuente verde bold, sin relleno
  //     if (preciosValidados[0]) {
  //       ws[preciosValidados[0].cellRef].s = {
  //         ...(ws[preciosValidados[0].cellRef].s || {}),
  //         font: { color: { rgb: "006100" }, bold: true },
  //       };
  //     }
  //     if (preciosValidados[1]) {
  //       ws[preciosValidados[1].cellRef].s = {
  //         ...(ws[preciosValidados[1].cellRef].s || {}),
  //         font: { color: { rgb: "006100" }, bold: true },
  //       };
  //     }
  //   }

  //   XLSX.utils.book_append_sheet(wb, ws, "PlanCompraOptimizado");
  //   XLSX.writeFile(wb, "PlanCompraOptimizado.xlsx");
  // };

  const exportToExcel = () => {
    if (!rows.length) return;

    // Preparar datos (incluye sinStock por proveedor)
    const dataToExport = rows.map((row) => {
      const proveedoresData = Object.keys(preciosProveedores).map((prov) => {
        const provDataGlobal = buscarProveedor(preciosProveedores[prov] || {}, [
          row.ean,
        ]);
        return {
          prov,
          unidades: row[prov] || 0,
          precio: row[`${prov}_precio_unit`] || 0,
          total: row[`costo_${prov}_num`] || 0,
          sinStock: !!provDataGlobal?.sinStock,
        };
      });

      // precioMinimo entre los que tienen stock y precio>0
      const preciosConStock = proveedoresData
        .filter((p) => p.precio > 0 && !p.sinStock)
        .map((p) => p.precio);
      const precioMinimo = preciosConStock.length
        ? Math.min(...preciosConStock)
        : 0;

      return {
        EAN: row.ean,
        Producto: row.producto,
        Minimo: row.minimo,
        Maximo: row.maximo,
        proveedoresData,
        precioMinimo,
      };
    });

    // Crear workbook y sheet
    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Cabecera
    const header = ["EAN", "Producto", "Minimo", "Maximo"];
    Object.keys(preciosProveedores).forEach((prov) => {
      header.push(`${prov} (unidades)`, `${prov} $/unidad`, `${prov} total`);
    });
    wsData.push(header);

    // Filas
    dataToExport.forEach((fila) => {
      const row = [fila.EAN, fila.Producto, fila.Minimo, fila.Maximo];
      Object.keys(preciosProveedores).forEach((prov) => {
        const p = fila.proveedoresData.find((x) => x.prov === prov);
        if (p) {
          row.push(p.unidades, p.precio, p.total);
        } else {
          row.push(0, 0, 0);
        }
      });
      wsData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 🔹 Estilos
    for (let r = 1; r < wsData.length; r++) {
      const fila = dataToExport[r - 1];

      // recolectar precios con info de stock
      const preciosValidados = []; // { precio, cellRef, sinStock }
      Object.keys(preciosProveedores).forEach((prov, i) => {
        const colPrecio = 4 + i * 3 + 1; // columna de precio unitario
        const cellRef = XLSX.utils.encode_cell({ r, c: colPrecio });
        if (!ws[cellRef]) return;

        const precio = parseFloat(wsData[r][colPrecio]) || 0;
        const provData = fila.proveedoresData.find((x) => x.prov === prov);
        const sinStock = provData?.sinStock;

        if (sinStock) {
          // ❌ sin stock → fondo rojo + fuente negra
          ws[cellRef].s = {
            fill: { fgColor: { rgb: "FFCCCC" } },
            font: { color: { rgb: "000000" }, bold: true },
          };
        } else if (precio > 0) {
          preciosValidados.push({ precio, cellRef });
        }
      });

      // ordenar disponibles por precio asc
      preciosValidados.sort((a, b) => a.precio - b.precio);

      // ✅ Mejor disponible → verde + bold
      if (preciosValidados[0]) {
        ws[preciosValidados[0].cellRef].s = {
          ...(ws[preciosValidados[0].cellRef].s || {}),
          font: { color: { rgb: "006100" }, bold: true },
        };
      }

      // ✅ Segundo mejor → solo si el primero de la fila estaba sin stock
      if (preciosValidados[1]) {
        const mejorOriginal = fila.proveedoresData.find(
          (x) => x.precio === fila.precioMinimo
        );
        if (mejorOriginal?.sinStock) {
          ws[preciosValidados[1].cellRef].s = {
            ...(ws[preciosValidados[1].cellRef].s || {}),
            font: { color: { rgb: "006100" } },
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "PlanCompraOptimizado");
    XLSX.writeFile(wb, "PlanCompraOptimizado.xlsx");
  };

  useEffect(() => {
    setFaltantes(nuevosFaltantes);
  }, [planCompra, preciosProveedores, resultado]);

  // --- Leer Excel ---
  const handleFileUpload = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      // usá readAsArrayBuffer si querés (más fiable) o binary como tenías:
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      const data = rawData.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [String(k).trim(), v])
        )
      );

      if (tipo === "pedido") {
        const mapped = data.map((row, idx) => {
          const rawCodes = String(
            row.EANs || row.codebar || row.EAN || row.Codebar || `ROW-${idx}`
          ).trim();

          const aliases = rawCodes
            .split("-")
            .map((c) => c.trim())
            .filter(Boolean);

          return {
            id: aliases[0] || `ROW-${idx}`,
            codebar: aliases[0] || `ROW-${idx}`,
            producto: row.producto || row.Producto || `Producto ${idx + 1}`,
            minimo: parseInt(row.minimo ?? row.Minimo ?? 0) || 0,
            maximo:
              parseInt(
                row.maximo ?? row.Maximo ?? row.minimo ?? row.Minimo ?? 9999
              ) || 9999,
            aliases, // 👈 ahora cada producto tiene todos los códigos
          };
        });

        setPlanCompra(mapped);
        return;
      }

      // Proveedores: guardamos sinStock basado en columna "Stock" (SI/NO)
      const mapProv = {};
      data.forEach((row, idx) => {
        let code = "";
        let precioFinal = 0;
        let minCantidad = 0;
        let bulto = 1;

        const keys = Object.keys(row);

        // Para Suizo usamos CodigoBarras
        if (tipo === "suizoArg") {
          code = String(row["CodigoBarras"] ?? "").trim();
        } else {
          // Para otros proveedores buscamos EAN o code
          code = String(
            row.EAN ?? row.Ean ?? row.ean ?? row.Codebar ?? row.codebar ?? ""
          ).trim();
        }

        if (!code) {
          console.warn(`Fila ${idx + 1} sin Código de Barra. Se ignora.`, row);
          return;
        }

        // Determinar sinStock por la columna Stock: "SI" = hay stock, "NO" = sin stock
        const sinStock =
          String(row["Stock"] || row["STOCK"] || "")
            .toUpperCase()
            .trim() === "NO";

        if (tipo === "delSud") {
          const colPrecio = keys.find(
            (k) => k.trim() === "Precio Final (sin IVA)"
          );
          if (!colPrecio) {
            console.warn("Columna precio no encontrada en DelSud:", keys);
            precioFinal = 0;
          } else {
            precioFinal = parseExcelNumber(row[colPrecio]);
          }
          minCantidad = 375;
          bulto = 1;
        } else if (tipo === "delSudNoTrans") {
          const colPrecio = keys.find(
            (k) => k.trim() === "Precio Final (sin IVA)"
          );
          precioFinal = colPrecio ? parseExcelNumber(row[colPrecio]) : 0;
          minCantidad = 0;
          bulto = 1;
        } else if (tipo === "suizoArg") {
          const colPrecio = "Precio_c_Dto_s_IVA";
          const precioBase = parseExcelNumber(row[colPrecio] ?? 0);
          bulto = parseInt(row["Bulto"] ?? 1) || 1;
          precioFinal = precioBase * 0.98;
          minCantidad = 0;
        } else if (tipo === "cofarsur") {
          const colPrecio = keys.find(
            (k) => k.trim().toLowerCase() === "precio comercio c/iva"
          );

          if (!colPrecio) {
            console.warn("Columna precio no encontrada en Cofarsur:", keys);
            precioFinal = 0;
          } else {
            let precioConIva = parseExcelNumber(row[colPrecio]);
            precioFinal = precioConIva / 1.21; // quitar IVA
          }
          minCantidad = 0;
          bulto = 1;
        } else if (tipo === "keller") {
          data.forEach((row, idx) => {
            const code = String(row["EAN"] ?? "").trim();
            if (!code) {
              console.warn(`Fila ${idx + 1} sin Código de Barra. Se ignora.`);
              return;
            }

            const precioFinal = parseExcelNumber(row["Precio Transfer"] ?? 0);
            const sinStock =
              String(row["Stock"] ?? "")
                .toUpperCase()
                .trim() === "NO";

            mapProv[code] = {
              precioFinal,
              minCantidad: 0,
              bulto: 1,
              sinStock,
            };
          });
        } else {
          const colPrecio = keys.find(
            (k) =>
              k.toLowerCase().includes("precio") ||
              k.toLowerCase().includes("price")
          );
          precioFinal = parseExcelNumber(row[colPrecio]);
          bulto = 1;
        }

        mapProv[code] = {
          precioFinal,
          minCantidad,
          bulto,
          sinStock, // <-- guardamos el flag
        };
      });

      setPreciosProveedores((prev) => ({ ...prev, [tipo]: mapProv }));
    };

    reader.readAsBinaryString(file);
  };

  // --- Optimización (usa sinStock para ignorar ofertas sin stock) ---
  const optimizarCompra = () => {
    const model = {
      optimize: "costo",
      opType: "min",
      constraints: {},
      variables: {},
      ints: {},
    };

    const delSud = preciosProveedores["delSud"] || {};
    const suizo = preciosProveedores["suizoArg"] || {};
    const cofa = preciosProveedores["cofarsur"] || {};
    const delSudNoTrans = preciosProveedores["delSudNoTrans"] || {};

    const tieneDelSud = !!Object.keys(delSud).length;

    // Solo si hay DelSud cargado, filtramos productos donde convenga
    const delSudValidos = tieneDelSud
      ? planCompra.filter((p) => {
          const precioDelSud = delSud[p.codebar]?.precioFinal ?? Infinity;
          const precioSuizo = suizo[p.codebar]?.precioFinal ?? Infinity;
          return precioDelSud < precioSuizo;
        })
      : [];

    // Si existe DelSud, aplicamos restricción global de 375
    if (tieneDelSud && delSudValidos.length) {
      model.constraints["totalDelSud"] = { min: 375 };
    }

    const nuevosFaltantes = [];

    planCompra.forEach((p) => {
      const restrNombre = `cant_${p.codebar}`;

      // Verificamos si hay al menos un proveedor con precio Y con stock
      const tienePrecioAlguno = Object.keys(preciosProveedores).some((prov) => {
        const provData = buscarProveedor(preciosProveedores[prov], p.aliases);
        return provData?.precioFinal > 0 && !provData?.sinStock;
      });

      if (!tienePrecioAlguno) {
        nuevosFaltantes.push({
          ean: p.codebar,
          producto: p.producto,
          proveedor: "sin precios o sin stock",
        });
        return; // saltar producto
      }

      model.constraints[restrNombre] = { min: p.minimo, max: p.maximo };

      Object.keys(preciosProveedores).forEach((prov) => {
        const provData = buscarProveedor(preciosProveedores[prov], p.aliases);
        const precioUnidad = Number(provData?.precioFinal || 0);
        const bulto = Number(provData?.bulto || 1);

        if (!precioUnidad) return; // ignorar proveedor sin precio
        if (provData?.sinStock) return; // IGNORAR proveedores sin stock

        // Si existe DelSud, descartamos DelSud más caro que Suizo
        if (prov === "delSud" && tieneDelSud) {
          const suizoData = buscarProveedor(suizo, p.aliases);
          if (suizoData?.precioFinal && precioUnidad >= suizoData.precioFinal) {
            return;
          }
        }

        const varName = `${p.codebar}_${prov}`;
        model.variables[varName] = {
          costo: precioUnidad * bulto,
          [restrNombre]: bulto,
        };

        // Si hay DelSud y este producto está en los válidos, sumar a totalDelSud
        if (
          tieneDelSud &&
          prov === "delSud" &&
          delSudValidos.find((x) => x.codebar === p.codebar)
        ) {
          model.variables[varName]["totalDelSud"] = bulto;
        }

        model.ints[varName] = 1;
      });
    });

    const result = solver.Solve(model);

    if (!result.feasible) {
      setErrorSolver(
        "❌ No se encontró solución factible con los datos actuales."
      );
      setResultado(null);
    } else {
      setErrorSolver("");

      // Calcular total de unidades compradas a DelSud (si existe)
      const totalDelSud = tieneDelSud
        ? Object.keys(result)
            .filter((k) => k.includes("_delSud"))
            .reduce((sum, k) => {
              const code = k.split("_")[0];
              const provData = buscarProveedor(delSud, [code]);
              return sum + (result[k] || 0) * (provData?.bulto || 1);
            }, 0)
        : 0;

      setResultado({ ...result, totalDelSud });
    }

    setFaltantes(nuevosFaltantes);
  };

  const nuevosFaltantes = [];
  // --- Filas DataGrid ---
  const rows = planCompra.map((p) => {
    const row = {
      id: p.id,
      ean: p.codebar,
      producto: p.producto,
      minimo: p.minimo,
      maximo: p.maximo,
      aliases: p.aliases || [p.codebar], // <-- para renderCell y búsquedas
    };

    Object.keys(preciosProveedores).forEach((prov) => {
      const varName = `${p.codebar}_${prov}`;
      const provData = buscarProveedor(
        preciosProveedores[prov] || {},
        p.aliases
      );

      const cantidadBultos = Number(resultado?.[varName] ?? 0);
      const unidadesReales = cantidadBultos * Number(provData?.bulto || 1);
      const precioUnidad = Number(provData?.precioFinal || 0);

      row[prov] = unidadesReales; // 0 si no hay precio o no se asignó
      row[`${prov}_precio_unit`] = precioUnidad || "";
      row[`costo_${prov}_num`] = precioUnidad
        ? unidadesReales * precioUnidad
        : 0;
      row[`costo_${prov}`] = precioUnidad ? unidadesReales * precioUnidad : "";
    });

    return row;
  });

  // ✅ Totales por proveedor
  const totalesProveedores = Object.keys(preciosProveedores).reduce(
    (acc, prov) => {
      acc[prov] = rows.reduce(
        (sum, row) => sum + (row[`costo_${prov}_num`] || 0),
        0
      );
      return acc;
    },
    {}
  );

  // ---- Columns: renderCell adaptado para sinStock y segundo mejor ----
  const columns = [
    { field: "ean", headerName: "EAN", width: 140 },
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "minimo", headerName: "Mín.", width: 90 },
    { field: "maximo", headerName: "Máx.", width: 90 },
    ...Object.keys(preciosProveedores).flatMap((prov) => [
      { field: prov, headerName: `${prov} (unidades)`, width: 140 },
      {
        field: `${prov}_precio_unit`,
        headerName: `${prov} $/unidad`,
        width: 140,
        type: "number",
        renderCell: (params) => {
          const precioActual = params.value;
          const prov = params.field.replace("_precio_unit", "");
          const provData = buscarProveedor(
            preciosProveedores[prov],
            params.row.aliases
          );
          const sinStock = provData?.sinStock;

          const preciosValidos = Object.keys(preciosProveedores)
            .map((p) => ({
              prov: p,
              precio: params.row[`${p}_precio_unit`],
              sinStock: buscarProveedor(
                preciosProveedores[p],
                params.row.aliases
              )?.sinStock,
            }))
            .filter((x) => x.precio > 0);

          // Ordenar por precio
          const ordenados = preciosValidos
            .filter((x) => !x.sinStock) // solo disponibles
            .sort((a, b) => a.precio - b.precio);

          const mejor = ordenados[0]?.prov;
          const segundo = ordenados[1]?.prov;

          const esMejor = prov === mejor;
          const esSegundo =
            prov === segundo &&
            !esMejor &&
            buscarProveedor(preciosProveedores[mejor], params.row.aliases)
              ?.sinStock;

          return (
            <span
              style={{
                fontWeight: esMejor ? "bold" : "normal",
                color: esMejor || esSegundo ? "green" : "black",
                backgroundColor: sinStock ? "#FFCCCC" : "transparent",
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              {precioActual ? precioActual.toFixed(2) : ""}
            </span>
          );
        },
      },
      {
        field: `costo_${prov}`,
        headerName: `${prov} $`,
        width: 140,
        type: "number",
        sortComparator: (v1, v2) => v1 - v2,
      },
    ]),
  ];

  const totalCosto = rows.reduce(
    (acc, row) =>
      acc +
      Object.keys(preciosProveedores).reduce(
        (sum, prov) => sum + (row[`costo_${prov}_num`] || 0),
        0
      ),
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Optimización de Compras Mejorada</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button variant="outlined" component="label">
          Subir Plan de Compra
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "pedido")}
          />
        </Button>
        <Button variant="outlined" component="label">
          Subir Precios Del Sud Transfer
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "delSud")}
          />
        </Button>

        <Button variant="outlined" component="label">
          Subir Precios Del Sud No transfer
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "delSudNoTrans")}
          />
        </Button>

        <Button variant="outlined" component="label">
          Subir Precios Suizo Arg
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "suizoArg")}
          />
        </Button>

        <Button variant="outlined" component="label">
          Subir Precios Cofarsur
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "cofarsur")}
          />
        </Button>

        {/* Botón para subir archivo de Keller */}
        <Button variant="outlined" component="label">
          Subir Precios Keller
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "keller")}
          />
        </Button>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={optimizarCompra}
        disabled={!planCompra.length || !Object.keys(preciosProveedores).length}
      >
        Optimizar
      </Button>

      {errorSolver && (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {errorSolver}
        </Alert>
      )}

      <div style={{ height: 500, marginTop: 20 }}>
        <DataGrid rows={rows} columns={columns} />
      </div>

      <div>
        {resultado && (
          <div style={{ marginTop: 20 }}>
            <strong>💰 Costo total: ${totalCosto.toFixed(2)}</strong>
            <br />
            <span
              style={{
                color: resultado.totalDelSud >= 375 ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              DelSud: {resultado.totalDelSud} unidades
              {resultado.totalDelSud < 375
                ? ` (faltan ${375 - resultado.totalDelSud})`
                : " ✅ mínimo alcanzado"}
            </span>
          </div>
        )}

        <br />
        <span
          style={{
            marginTop: 10,
            display: "inline-block",
            color: "blue",
            fontWeight: "bold",
          }}
        >
          💰 Costo si toda la compra se hiciera con Del Sud No Transfer: $
          {planCompra
            .reduce((sum, p) => {
              const provData = buscarProveedor(
                preciosProveedores["delSudNoTrans"] || {},
                p.aliases
              );
              if (!provData?.precioFinal || provData?.sinStock) return sum; // ignorar si no hay precio o está sin stock
              const cantidad = p.maximo; // usar maximo del plan de compra
              const bulto = provData.bulto || 1;
              const precioUnidad = provData.precioFinal || 0;
              return sum + cantidad * precioUnidad * bulto;
            }, 0)
            .toFixed(2)}
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={exportToExcel}
          disabled={!resultado}
        >
          Exportar a Excel
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={exportFaltantes}
          disabled={!faltantes.length}
          style={{ marginLeft: "10px" }}
        >
          Exportar Faltantes
        </Button>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>💰 Costo total: ${totalCosto.toFixed(2)}</strong>
        <div>
          {Object.entries(totalesProveedores).map(([prov, total]) => (
            <div key={prov}>
              {prov}: ${total.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
