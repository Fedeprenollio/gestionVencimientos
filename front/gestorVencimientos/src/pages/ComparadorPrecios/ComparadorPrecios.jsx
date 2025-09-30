import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
  // --- Exportar a Excel ---
  const exportToExcel = () => {
    if (!rows.length) return;
    const dataToExport = rows.map((row) => {
      const newRow = {
        EAN: row.ean,
        Producto: row.producto,
        Minimo: row.minimo,
        Maximo: row.maximo,
      };
      Object.keys(preciosProveedores).forEach((prov) => {
        newRow[`${prov} (unidades)`] = row[prov];
        newRow[`${prov} $`] = row[`costo_${prov}_num`];
      });
      return newRow;
    });
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PlanCompraOptimizado");
    XLSX.writeFile(wb, "PlanCompraOptimizado.xlsx");
  };

  useEffect(() => {
    setFaltantes(nuevosFaltantes);
  }, [planCompra, preciosProveedores, resultado]);
  // --- Leer Excel ---
  const handleFileUpload = (e, tipo) => {
    console.log("TIPOOO", tipo);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
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

      // if (tipo === "pedido") {
      //   const mapped = data.map((row, idx) => ({
      //     id: String(
      //       row.codebar || row.EAN || row.Codebar || `ROW-${idx}`
      //     ).trim(),
      //     codebar: String(
      //       row.codebar || row.EAN || row.Codebar || `ROW-${idx}`
      //     ).trim(),
      //     producto: row.producto || row.Producto || `Producto ${idx + 1}`,
      //     minimo: parseInt(row.minimo ?? row.Minimo ?? 0) || 0,
      //     maximo:
      //       parseInt(
      //         row.maximo ?? row.Maximo ?? row.minimo ?? row.Minimo ?? 9999
      //       ) || 9999,
      //   }));
      //   setPlanCompra(mapped);
      //   return;
      // }

      // Proveedores
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
          // mapProv[code] = { precioFinal, minCantidad, bulto };
        } else if (tipo === "suizoArg") {
          const colPrecio = "Precio_c_Dto_s_IVA";

          const precioBase = parseExcelNumber(row[colPrecio] ?? 0);
          bulto = parseInt(row["Bulto"] ?? 1) || 1; // si hay columna bulto
          precioFinal = precioBase * 0.98; // precio unitario con descuento
          minCantidad = 0;
        } else if (tipo === "cofarsur") {
          const colPrecio = keys.find(
            (k) => k.trim().toLowerCase() === "precio comercio c/iva"
          );
          console.log("ENTRA A COFA");
          if (!colPrecio) {
            console.warn("Columna precio no encontrada en Cofarsur:", keys);
            precioFinal = 0;
          } else {
            let precioConIva = parseExcelNumber(row[colPrecio]);

            precioFinal = precioConIva / 1.21; // 👈 quitar IVA
          }

          minCantidad = 0;
          bulto = 1;

          console.log("Cofarsur código:", code, "Precio sin IVA:", precioFinal);
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
        };
      });

      setPreciosProveedores((prev) => ({ ...prev, [tipo]: mapProv }));
    };

    reader.readAsBinaryString(file);
  };

  // // --- Leer Excel ---

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

    // Filtrar productos donde DelSud es más barato que Suizo
    const delSudValidos = planCompra.filter((p) => {
      const precioDelSud = delSud[p.codebar]?.precioFinal ?? Infinity;
      const precioSuizo = suizo[p.codebar]?.precioFinal ?? Infinity;
      return precioDelSud < precioSuizo;
    });

    // if (delSudValidos.length) {
    //   // Crear restricción global mínima de 375 unidades solo para DelSud “válidos”
    //   model.constraints["totalDelSud"] = { min: 375 };
    // }

    // planCompra.forEach((p) => {
    //   const restrNombre = `cant_${p.codebar}`;
    //   model.constraints[restrNombre] = { min: p.minimo, max: p.maximo };

    //   Object.keys(preciosProveedores).forEach((prov) => {
    //     const varName = `${p.codebar}_${prov}`;
    //     // const provData = preciosProveedores[prov]?.[p.codebar] || {};
    //     const provData = buscarProveedor(
    //       preciosProveedores[prov] || {},
    //       p.aliases
    //     );

    //     const precioUnidad = Number(provData.precioFinal || 0);
    //     const bulto = Number(provData.bulto || 1);

    //     // Solo permitir DelSud si es más barato que Suizo
    //     if (prov === "delSud") {
    //       const precioSuizo = suizo[p.codebar]?.precioFinal ?? Infinity;
    //       if (precioUnidad >= precioSuizo) return; // ignorar DelSud caro
    //     }

    //     if (!precioUnidad || precioUnidad === 0) return; // 👈 descartamos sin precio

    //     model.variables[varName] = {
    //       costo: precioUnidad * bulto,
    //       [restrNombre]: bulto,
    //     };

    //     // Si es DelSud válido, se suma al totalDelSud
    //     if (
    //       prov === "delSud" &&
    //       delSudValidos.find((x) => x.codebar === p.codebar)
    //     ) {
    //       model.variables[varName]["totalDelSud"] = bulto;
    //     }

    //     model.ints[varName] = 1;
    //   });
    // });

    planCompra.forEach((p) => {
      const restrNombre = `cant_${p.codebar}`;

      // Revisar que ambos proveedores tengan precio
      const delSudData = buscarProveedor(delSud, p.aliases);
      const suizoData = buscarProveedor(suizo, p.aliases);

      if (!delSudData?.precioFinal || !suizoData?.precioFinal) {
        nuevosFaltantes.push({
          ean: p.codebar,
          producto: p.producto,
          proveedor: "precio faltante",
        });
        return; // producto completo fuera
      }

      model.constraints[restrNombre] = { min: p.minimo, max: p.maximo };

      Object.keys(preciosProveedores).forEach((prov) => {
        const provData = buscarProveedor(preciosProveedores[prov], p.aliases);
        const precioUnidad = Number(provData?.precioFinal || 0);
        const bulto = Number(provData?.bulto || 1);

        if (!precioUnidad) return; // ignorar proveedor sin precio

        // Solo DelSud más barato que Suizo
        if (prov === "delSud" && precioUnidad >= suizoData.precioFinal) return;

        const varName = `${p.codebar}_${prov}`;
        model.variables[varName] = {
          costo: precioUnidad * bulto,
          [restrNombre]: bulto,
        };

        if (
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
      setResultado(result);
    }
    const totalDelSud = Object.keys(result)
      .filter((k) => k.includes("_delSud"))
      .reduce((sum, k) => {
        const code = k.split("_")[0];
        const provData = buscarProveedor(delSud, [code]);
        return sum + (result[k] || 0) * (provData?.bulto || 1);
      }, 0);

    setResultado({ ...result, totalDelSud });
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

      row[prov] = unidadesReales; // 0 si no hay precio
      row[`${prov}_precio_unit`] = precioUnidad || "";
      row[`costo_${prov}_num`] = precioUnidad
        ? unidadesReales * precioUnidad
        : 0;
      row[`costo_${prov}`] = precioUnidad ? unidadesReales * precioUnidad : "";
    });

    return row;
  });

  // ✅ Aquí calculás totales por proveedor
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
        width: 120,
        type: "number",
        // renderCell: (params) => {
        //   const precioActual = params.value ?? Infinity;

        //   // Buscar el menor precio de TODOS los proveedores
        //   const precios = Object.keys(preciosProveedores).map(
        //     (p) => params.row[`${p}_precio_unit`] ?? Infinity
        //   );

        //   const precioMinimo = Math.min(...precios);
        //   const esMasBarato = precioActual > 0 && precioActual === precioMinimo;

        //   return (
        //     <span
        //       style={{
        //         fontWeight: esMasBarato ? "bold" : "normal",
        //         color: esMasBarato ? "green" : "inherit",
        //       }}
        //     >
        //       {precioActual || ""}
        //     </span>
        //   );
        // },
        renderCell: (params) => {
          const precioActual = params.value;

          // Tomar solo precios que existan (ignorar null, "", 0)
          const precios = Object.keys(preciosProveedores)
            .map((p) => params.row[`${p}_precio_unit`])
            .filter((v) => v > 0);

          const precioMinimo = precios.length ? Math.min(...precios) : Infinity;
          const esMasBarato = precioActual > 0 && precioActual === precioMinimo;

          return (
            <span
              style={{
                fontWeight: esMasBarato ? "bold" : "normal",
                color: esMasBarato ? "green" : "inherit",
                border: esMasBarato ? "2px solid green" : "none", // 👈 borde
                padding: "2px 4px", // opcional, para que el borde no quede pegado al texto
                borderRadius: "4px", // opcional, para borde redondeado
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
    {/* --- NUEVO: costo total si toda la compra fuera Del Sud No Transfer --- */}
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
          if (!provData?.precioFinal) return sum; // ignorar si no hay precio
          const cantidad = p.maximo; // usar maximo del plan de compra
          const bulto = provData.bulto || 1;
          const precioUnidad = provData.precioFinal || 0;
          return sum + cantidad * precioUnidad * bulto;
        }, 0)
        .toFixed(2)}
    </span>
      </div>

   

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
