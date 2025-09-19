// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { Tabs, Tab, Box, Typography, Button } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";

// const calcularABC = (data, key) => {
//   const grupos = {};
//   data.forEach((row) => {
//     if (!grupos[row[key]]) grupos[row[key]] = { nombre: row.NombreFantasia, items: [] };
//     grupos[row[key]].items.push(row);
//   });

//   const resultado = {};
//   Object.keys(grupos).forEach((sucursal) => {
//     const grupo = [...grupos[sucursal].items];

//     // ABC Ventas
//     grupo.sort((a, b) => b.ACCli - a.ACCli);
//     const totalVentas = grupo.reduce((sum, r) => sum + r.ACCli, 0);
//     let acumuladoVentas = 0;
//     grupo.forEach((r) => {
//       r["%Ventas"] = (r.ACCli / totalVentas) * 100;
//       acumuladoVentas += r["%Ventas"];
//       r["%AcumVentas"] = acumuladoVentas;
//       r["ClasificacionVentas"] =
//         acumuladoVentas <= 80 ? "A" : acumuladoVentas <= 95 ? "B" : "C";
//     });

//     // ABC Unidades
//     grupo.sort((a, b) => b.cajas - a.cajas);
//     const totalUnidades = grupo.reduce((sum, r) => sum + r.cajas, 0);
//     let acumuladoUnidades = 0;
//     grupo.forEach((r) => {
//       r["%Unidades"] = (r.cajas / totalUnidades) * 100;
//       acumuladoUnidades += r["%Unidades"];
//       r["%AcumUnidades"] = acumuladoUnidades;
//       r["ClasificacionUnidades"] =
//         acumuladoUnidades <= 80 ? "A" : acumuladoUnidades <= 95 ? "B" : "C";
//     });

//     resultado[sucursal] = { nombre: grupos[sucursal].nombre, items: grupo };
//   });

//   return resultado;
// };

// export default function ABCViewer() {
//   const [abcData, setAbcData] = useState({});
//   const [tab, setTab] = useState("");

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const workbook = XLSX.read(event.target.result, { type: "binary" });
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Normalizamos codebar y CodigosBarra
//       const normalizado = jsonData.map((row) => {
//         let cb = row.codebar ?? "";
//         if (typeof cb === "number") cb = cb.toString();

//         let cbExtra = row.CodigosBarra ?? "";
//         if (typeof cbExtra === "number") cbExtra = cbExtra.toString();
//         if (typeof cbExtra === "string" && cbExtra.includes("-")) {
//           cbExtra = cbExtra.split("-").map((c) => c.trim());
//         }

//         return {
//           ...row,
//           codebar: cb.toString().trim(),
//           codigosExtra: cbExtra,
//         };
//       });

//       const abc = calcularABC(normalizado, "sucursal");
//       setAbcData(abc);
//       setTab(Object.keys(abc)[0]);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleExportExcel = () => {
//     const wb = XLSX.utils.book_new();

//     Object.entries(abcData).forEach(([sucursal, data]) => {
//       const hoja = data.items.map((row) => ({
//         sucursal: row.sucursal,
//         NombreFantasia: row.NombreFantasia,
//         producto: row.producto,
//         codebar: row.codebar,
//         CodigosBarra: Array.isArray(row.codigosExtra)
//           ? row.codigosExtra.join(" - ")
//           : row.codigosExtra ?? "",
//         cajas: row.cajas,
//         ACCli: row.ACCli,
//         "%Ventas": row["%Ventas"]?.toFixed(2) + "%",
//         "%AcumVentas": row["%AcumVentas"]?.toFixed(2) + "%",
//         ClasificacionVentas: row["ClasificacionVentas"],
//         "%Unidades": row["%Unidades"]?.toFixed(2) + "%",
//         "%AcumUnidades": row["%AcumUnidades"]?.toFixed(2) + "%",
//         ClasificacionUnidades: row["ClasificacionUnidades"],
//       }));

//       const ws = XLSX.utils.json_to_sheet(hoja);
//       XLSX.utils.book_append_sheet(wb, ws, data.nombre.slice(0, 30));
//     });

//     XLSX.writeFile(wb, "ABC_por_sucursal.xlsx");
//   };

//   const columns = [
//     { field: "sucursal", headerName: "Sucursal", flex: 0.4 },
//     { field: "NombreFantasia", headerName: "Nombre Fantasía", flex: 1 },
//     { field: "producto", headerName: "Producto", flex: 1.2 },
//     {
//       field: "codebar",
//       headerName: "Codebar",
//       flex: 0.8,
//       renderCell: (params) => params.value ?? "",
//     },
//     // {
//     //   field: "codigosExtra",
//     //   headerName: "Codigos Barra",
//     //   flex: 1,
//     //   renderCell: (params) =>
//     //     Array.isArray(params.value) ? (
//     //       <div style={{ display: "flex", flexDirection: "column" }}>
//     //         {params.value.map((c, i) => (
//     //           <span key={i}>{c}</span>
//     //         ))}
//     //       </div>
//     //     ) : (
//     //       params.value ?? ""
//     //     ),
//     // },
//     { field: "cajas", headerName: "Cajas", type: "number", flex: 0.5 },
//     { field: "ACCli", headerName: "Ventas", type: "number", flex: 0.8 },
//     {
//       field: "%Ventas",
//       headerName: "% Ventas",
//       type: "number",
//       flex: 0.6,

//     },
//     {
//       field: "%AcumVentas",
//       headerName: "% Acum Ventas",
//       type: "number",
//       flex: 0.7,

//     },
//     { field: "ClasificacionVentas", headerName: "ABC Ventas", flex: 0.4 },
//     {
//       field: "%Unidades",
//       headerName: "% Unidades",
//       type: "number",
//       flex: 0.6,

//     },
//     {
//       field: "%AcumUnidades",
//       headerName: "% Acum Unidades",
//       type: "number",
//       flex: 0.7,

//     },
//     { field: "ClasificacionUnidades", headerName: "ABC Unidades", flex: 0.4 },
//   ];

//   return (
//     <Box p={3}>
//       <Typography variant="h4" gutterBottom>
//         ABC de Ventas y Unidades por Sucursal
//       </Typography>

//       <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

//       {Object.keys(abcData).length > 0 && (
//         <>
//           <Button
//             variant="contained"
//             color="primary"
//             sx={{ mt: 2, mb: 2 }}
//             onClick={handleExportExcel}
//           >
//             Exportar a Excel
//           </Button>

//           <Tabs
//             value={tab}
//             onChange={(e, newValue) => setTab(newValue)}
//             variant="scrollable"
//             scrollButtons="auto"
//             allowScrollButtonsMobile
//             sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}
//           >
//             {Object.entries(abcData).map(([sucursal, data]) => (
//               <Tab key={sucursal} value={sucursal} label={data.nombre} />
//             ))}
//           </Tabs>

//           {Object.entries(abcData).map(
//             ([sucursal, data]) =>
//               sucursal === tab && (
//                 <Box key={sucursal} sx={{ height: 500, mt: 2 }}>
//                   <DataGrid
//                     rows={data.items.map((row, i) => ({ id: i, ...row }))}
//                     columns={columns}
//                     pageSize={10}
//                     rowsPerPageOptions={[10, 20, 50]}
//                   />
//                 </Box>
//               )
//           )}
//         </>
//       )}
//     </Box>
//   );
// }

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Tabs, Tab, Box, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function ABCViewer() {
  const [ventas, setVentas] = useState([]);
  const [stock, setStock] = useState([]);
  const [abcData, setAbcData] = useState({});
  const [selectedSucursal, setSelectedSucursal] = useState(null);

  console.log("📊 Estado inicial:", { ventas, stock, abcData });

  // --- Manejo de archivos ---
  const handleFileUpload = (event, tipo) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      console.log(`📂 Archivo ${tipo} cargado:`, json.length, "filas");

      if (tipo === "ventas") setVentas(json);
      if (tipo === "stock") setStock(json);
    };
    reader.readAsArrayBuffer(file);
  };

  // --- Procesar cuando tengamos ambos archivos ---
  useEffect(() => {
    if (ventas.length > 0 && stock.length > 0) {
      procesarABC(ventas, stock);
    }
  }, [ventas, stock]);

  const procesarABC = (ventasData, stockData) => {
    console.log("🔧 Procesando ABC...");
    console.log("📦 Primer fila del STOCK:", stockData[0]);
    console.log("📦 Claves en fila de stock:", Object.keys(stockData[0]));

    const agrupado = {};
    ventasData.forEach((row) => {
      const suc = row.sucursal;
      if (!agrupado[suc]) {
        agrupado[suc] = { items: [], NombreFantasia: row.NombreFantasia };
      }

      const stockRow = stockData.find(
        (s) =>
          Number(s.IDProducto) === Number(row.idproducto) &&
          Number(s.Sucursal) === Number(row.sucursal)
      );

      const unidadesStock = stockRow
        ? Number(stockRow["Cajas Stock Suc."] ?? 0)
        : 0;

      agrupado[suc].items.push({
        ...row,
        codebar: row.codebar || row.Codebar || "",
        stock: unidadesStock,
      });
    });

    // Calcular ABC y DSI
    Object.keys(agrupado).forEach((suc) => {
      const items = agrupado[suc].items;

      const totalVentas = items.reduce((acc, i) => acc + (i.ACCli || 0), 0);
      const totalUnidades = items.reduce((acc, i) => acc + (i.cajas || 0), 0);

      // ABC por ventas
      const ordenVentas = [...items].sort(
        (a, b) => (b.ACCli || 0) - (a.ACCli || 0)
      );
      let acumVentas = 0;
      ordenVentas.forEach((item) => {
        const pct = totalVentas ? (item.ACCli / totalVentas) * 100 : 0;
        acumVentas += pct;
        item["%Ventas"] = pct;
        item["%AcumVentas"] = acumVentas;
        item.ClasificacionVentas =
          acumVentas <= 80 ? "A" : acumVentas <= 95 ? "B" : "C";
      });

      // ABC por unidades + DSI
      const ordenUnidades = [...items].sort(
        (a, b) => (b.cajas || 0) - (a.cajas || 0)
      );
      let acumUnidades = 0;
      ordenUnidades.forEach((item) => {
        const pct = totalUnidades ? (item.cajas / totalUnidades) * 100 : 0;
        acumUnidades += pct;
        item["%Unidades"] = pct;
        item["%AcumUnidades"] = acumUnidades;
        item.ClasificacionUnidades =
          acumUnidades <= 80 ? "A" : acumUnidades <= 95 ? "B" : "C";

        const consumoDiario = item.cajas > 0 ? item.cajas / 365 : 0;
        item.dsi =
          consumoDiario > 0
            ? Number((item.stock / consumoDiario).toFixed(1))
            : 0;
      });

      agrupado[suc].items = items;
    });

    setAbcData(agrupado);

    const keys = Object.keys(agrupado);
    if (!keys.includes(String(selectedSucursal))) {
      setSelectedSucursal(keys[0] ?? null);
    }
  };

  // --- Exportar a Excel ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    Object.entries(abcData).forEach(([suc, data]) => {
      const ws = XLSX.utils.json_to_sheet(data.items);
      const sheetName =
        data.NombreFantasia?.substring(0, 31) || `Sucursal_${suc}`; // Excel limita a 31 caracteres
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, "ABC_DSI_Sucursales.xlsx");
  };

  // --- Estilos para celdas ---
  const celeste = "#e3f2fd";
  const verde = "#e8f5e9";

  const columns = [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "codebar", headerName: "Codebar", width: 150 },
    {
      field: "cajas",
      headerName: "Unidades vendidas",
      width: 90,
      cellClassName: "unidades-cell",
    },
    {
      field: "ACCli",
      headerName: "Ventas $",
      width: 120,
      cellClassName: "dinero-cell",
    },
    {
      field: "%Ventas",
      headerName: "% Ventas",
      width: 110,
      cellClassName: "dinero-cell",
    
    },
    {
      field: "%AcumVentas",
      headerName: "% Acum Ventas",
      width: 130,
      cellClassName: "dinero-cell",
     
    },
    { field: "ClasificacionVentas", headerName: "ABC Ventas", width: 110 },
    {
      field: "%Unidades",
      headerName: "% Unidades",
      width: 110,
      cellClassName: "unidades-cell",
     
    },
    {
      field: "%AcumUnidades",
      headerName: "% Acum Unidades",
      width: 140,
      cellClassName: "unidades-cell",
     
    },
    { field: "ClasificacionUnidades", headerName: "ABC Unidades", width: 130 },
    { field: "stock", headerName: "Stock", width: 100 },
    {
      field: "dsi",
      headerName: "DSI (días)",
      width: 120,
      renderCell: (params) => {
        const value = params.value ?? 0;
        let color = "#ccc";

        if (value <= 30) color = "#e53935";
        else if (value <= 90) color = "#43a047";
        else if (value <= 180) color = "#fdd835";
        else if (value <= 365) color = "#fb8c00";
        else color = "#6a1b9a";

        return (
          <span
            style={{
              backgroundColor: color,
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <style>
        {`
          .dinero-cell {
            background-color: ${celeste};
          }
          .unidades-cell {
            background-color: ${verde};
          }
        `}
      </style>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="body2">📥 Cargar archivo de Ventas</Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "ventas")}
          />
        </Box>
        <Box>
          <Typography variant="body2">📥 Cargar archivo de Stock</Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "stock")}
          />
        </Box>
      </Box>

      {Object.keys(abcData).length > 0 ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Tabs
              value={selectedSucursal ?? false}
              onChange={(e, newValue) => setSelectedSucursal(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider", flex: 1 }}
            >
              {Object.entries(abcData).map(([suc, data]) => (
                <Tab
                  key={suc}
                  label={data.NombreFantasia || `Sucursal ${suc}`}
                  value={suc}
                />
              ))}
            </Tabs>

            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcel}
              sx={{ ml: 2 }}
            >
              📤 Exportar Excel
            </Button>
          </Box>

          {selectedSucursal && abcData[selectedSucursal] ? (
            <Box sx={{ height: 500, width: "100%", mt: 2 }}>
              <DataGrid
                rows={abcData[selectedSucursal].items.map((item, idx) => ({
                  id: idx,
                  ...item,
                }))}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selecciona una sucursal para ver sus datos.
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body2">
          📂 Sube ambos archivos (ventas y stock) para ver el análisis ABC + DSI.
        </Typography>
      )}
    </Box>
  );
}
