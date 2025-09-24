import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import solver from "javascript-lp-solver";

export default function ComparadorPrecios() {
  const [planCompra, setPlanCompra] = useState([]);
  const [preciosProveedores, setPreciosProveedores] = useState({});
  const [resultado, setResultado] = useState(null);

  // --- Función para exportar ---
  const exportToExcel = () => {
    if (!rows.length) return;

    // Transformamos las filas en un array de objetos plano
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

  // --- Leer Excel ---
  const handleFileUpload = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      const data = rawData.map((row) =>
        Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v]))
      );

      if (tipo === "pedido") {
        const mapped = data.map((row, idx) => ({
          id: String(row.codebar).trim() || `ROW-${idx}`,
          codebar: String(row.codebar).trim(),
          producto: row.producto || `Producto ${idx + 1}`,
          minimo: parseInt(row.minimo || 0),
          maximo: parseInt(row.maximo || row.minimo || 9999),
        }));
        setPlanCompra(mapped);
      } else {
        const keys = Object.keys(data[0] || {});
        const colEan = keys.find((k) => k.toLowerCase().includes("ean"));
        const colPrecio = keys.find((k) => k.toLowerCase().includes("precio"));
        if (!colEan || !colPrecio) {
          alert(`No se pudo detectar Ean o Precio en ${tipo}`);
          return;
        }

        const mapProv = {};
        data.forEach((row) => {
          const code = String(row[colEan]).trim();
          const precio =
            parseFloat(String(row[colPrecio]).replace(",", ".")) || 0;
          mapProv[code] = { precioFinal: precio };
        });
        setPreciosProveedores((prev) => ({ ...prev, [tipo]: mapProv }));
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- Optimización ---
  const optimizarCompra = () => {
    const model = {
      optimize: "costo",
      opType: "min",
      constraints: {},
      variables: {},
      ints: {},
    };

    // Restricción global de total mínimo de unidades
    const MIN_TOTAL_UNIDADES = 4100;
    model.constraints["total_min"] = { min: MIN_TOTAL_UNIDADES };

    planCompra.forEach((p) => {
      const restrNombre = `cant_${p.codebar}`;
      model.constraints[restrNombre] = { min: p.minimo, max: p.maximo };

      Object.keys(preciosProveedores).forEach((prov) => {
        const varName = `${p.codebar}_${prov}`;
        const precio = preciosProveedores[prov]?.[p.codebar]?.precioFinal ?? 0;

        model.variables[varName] = {
          costo: precio,
          [restrNombre]: 1, // por producto
          total_min: 1, // contribuye al total mínimo
        };
        model.ints[varName] = 1;
      });
    });

    const result = solver.Solve(model);
    setResultado(result);
    console.log("Resultado solver:", result);
  };

  // --- Preparar filas DataGrid ---
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
      const cantidad = resultado?.[varName] ?? 0;
      const existe = preciosProveedores[prov]?.[p.codebar];

      row[prov] = existe ? cantidad : 0;
      row[`costo_${prov}_num`] = existe
        ? cantidad * preciosProveedores[prov][p.codebar].precioFinal
        : 0;
      row[`costo_${prov}`] = row[`costo_${prov}_num`]; // número real para ordenar
    });

    return row;
  });

  // --- Columnas DataGrid ---
  const columns = [
    { field: "ean", headerName: "EAN", width: 140 },
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "minimo", headerName: "Mín.", width: 90 },
    { field: "maximo", headerName: "Máx.", width: 90 },
    ...Object.keys(preciosProveedores).flatMap((prov) => [
      { field: prov, headerName: `${prov} (unidades)`, width: 140 },
      {
        field: `costo_${prov}`,
        headerName: `${prov} $`,
        width: 120,
        type: "number",
        sortComparator: (v1, v2) => v1 - v2,
      },
    ]),
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Optimización de Compras</h2>

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
          Subir Precios Del Sud
          <input
            type="file"
            hidden
            onChange={(e) => handleFileUpload(e, "delSud")}
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

      <div style={{ height: 500, marginTop: 20 }}>
        <DataGrid rows={rows} columns={columns} />
      </div>

      <Button
        variant="outlined"
        color="secondary"
        onClick={exportToExcel}
        disabled={!resultado}
      >
        Exportar a Excel
      </Button>

      {resultado && (
        <div style={{ marginTop: 20 }}>
          <strong>💰 Costo total: {resultado.result.toFixed(2)}</strong>
        </div>
      )}
    </div>
  );
}
