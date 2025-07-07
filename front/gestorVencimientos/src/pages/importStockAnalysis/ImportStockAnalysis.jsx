// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { Box, Button, Typography, CircularProgress } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";

// export default function ImportStockAnalysis() {
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState([]);

//   const columns = [
//     { field: "codebar", headerName: "Código de Barra", width: 160 },
//     {
//       field: "productName",
//       headerName: "Producto / Operación",
//       flex: 1,
//       minWidth: 220,
//     },
//     { field: "lastSaleDate", headerName: "Última Venta", width: 140 },
//     {
//       field: "totalSold",
//       headerName: "Cantidad Vendida",
//       type: "number",
//       width: 160,
//     },
//     { field: "stock", headerName: "Stock Actual", type: "number", width: 130 },
//   ];

//   const handleFiles = async (e) => {
//     const files = e.target.files;
//     if (files.length < 2) {
//       alert("Selecciona ambos archivos: Movimientos y Stock");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Leer Movimientos (archivo 0)
//       const movBuffer = await files[0].arrayBuffer();
//       const wbMov = XLSX.read(movBuffer, { type: "array" });
//       const wsMov = wbMov.Sheets[wbMov.SheetNames[0]];
//       const movJson = XLSX.utils.sheet_to_json(wsMov);

//       // Leer Stock (archivo 1)
//       const stockBuffer = await files[1].arrayBuffer();
//       const wbStock = XLSX.read(stockBuffer, { type: "array" });
//       const wsStock = wbStock.Sheets[wbStock.SheetNames[0]];
//       const stockJson = XLSX.utils.sheet_to_json(wsStock);

//       // Mapear stock por codebar para acceso rápido
//       const stockMap = {};
//       stockJson.forEach((item) => {
//         const codebar = item.Codebar?.toString().trim();
//         if (!codebar) return;
//         // Cantidad de stock puede ser 0 o negativo (lo consideramos)
//         stockMap[codebar] = Number(item.Cantidad) || 0;
//       });

//       // Filtrar movimientos que sean ventas/envíos/transferencias y sumar cantidades vendidas
//       // Defino keywords para considerar operación de venta o salida stock
//       const ventaKeywords = [
//         "Facturacion",
//         "Facturacion FV",
//         "Factura",
//         "Venta",
//         "Transferencia",
//         "Envio",
//         "Baja",
//         "Despacho",
//         "Salida",
//         "Remito",
//         "Pedido",
//       ];

//       // Map para sumar cantidades vendidas y trackear última fecha de venta
//       const ventasMap = {};

//       movJson.forEach((m) => {
//         const codebar = m.Codebar?.toString().trim();
//         const operacion = m.Operacion?.toString() || "";
//         const cantidad = Number(m.Cantidad) || 0;
//         const fechaRaw = m.Fecha || m.Date || "";
//         console.log("fechaRaw", fechaRaw);
//         if (!codebar || cantidad >= 0) return; // Solo cantidades negativas = salida (venta/envío)

//         // Check si la operación indica venta/envío
//         const isVenta = ventaKeywords.some((kw) =>
//           operacion.toLowerCase().includes(kw.toLowerCase())
//         );
//         if (!isVenta) return;

//         let fecha;
//         if (!isNaN(fechaRaw)) {
//           const excelDate = XLSX.SSF.parse_date_code(Number(fechaRaw));
//           fecha = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
//         } else {
//           fecha = new Date(fechaRaw);
//         }

//         if (!ventasMap[codebar]) {
//           ventasMap[codebar] = {
//             totalSold: 0,
//             lastSaleDate: null,
//             productName: m.Producto || "",
//           };
//         }

//         ventasMap[codebar].totalSold += Math.abs(cantidad);
//         if (
//           !ventasMap[codebar].lastSaleDate ||
//           fecha > ventasMap[codebar].lastSaleDate
//         ) {
//           ventasMap[codebar].lastSaleDate = fecha;
//           ventasMap[codebar].productName =
//             m.Producto || ventasMap[codebar].productName;
//         }
//       });

//       // Filtrar solo los productos que tienen stock 0 o negativo
//       const filtered = Object.entries(ventasMap)
//         .filter(([codebar]) => {
//           const stockCant = stockMap[codebar];
//           return stockCant === 0 || stockCant < 0 || stockCant === undefined;
//         })
//         .map(([codebar, data]) => ({
//           codebar,
//           productName: data.productName,
//           lastSaleDate: data.lastSaleDate
//             ? data.lastSaleDate.toLocaleDateString()
//             : "",
//           totalSold: data.totalSold,
//           stock: stockMap[codebar] ?? 0,
//         }))
//         .sort((a, b) => b.totalSold - a.totalSold);

//       setResults(filtered);
//     } catch (error) {
//       console.error("Error leyendo archivos:", error);
//       alert("Error procesando archivos, revisa consola.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   console.log("PRODCTOS,", results);
//   // Exportar a Excel
//   const exportToExcel = () => {
//     if (results.length === 0) {
//       alert("No hay datos para exportar");
//       return;
//     }
//     const wsData = results.map(
//       ({ codebar, productName, lastSaleDate, totalSold, stock }) => ({
//         "Código de Barra": codebar,
//         Producto: productName,
//         "Última Venta": lastSaleDate,
//         "Cantidad Vendida": totalSold,
//         "Stock Actual": stock,
//       })
//     );

//     const ws = XLSX.utils.json_to_sheet(wsData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "VentasVsStock");

//     XLSX.writeFile(wb, "ventas_vs_stock.xlsx");
//   };

//   return (
//     <Box p={2}>
//       <Typography variant="h5" mb={2}>
//         Reporte: Productos vendidos/enviados con stock 0 o negativo
//       </Typography>

//       <Typography mb={1}>
//         Selecciona <strong>dos archivos Excel</strong>: primero el de
//         movimientos, luego el de stock actual.
//       </Typography>
//       <input
//         type="file"
//         accept=".xls,.xlsx"
//         multiple
//         onChange={handleFiles}
//         disabled={loading}
//       />

//       {loading && (
//         <Box mt={2} display="flex" alignItems="center" gap={1}>
//           <CircularProgress size={24} />
//           <Typography>Procesando archivos...</Typography>
//         </Box>
//       )}

//       {results.length > 0 && (
//         <>
//           <Box mt={3} mb={1} display="flex" alignItems="center" gap={2}>
//             <Typography variant="h6">Resultados ({results.length})</Typography>
//             <Button variant="outlined" onClick={exportToExcel}>
//               Exportar a Excel
//             </Button>
//           </Box>

//           <Box sx={{ height: 500, width: "100%" }}>
//             <DataGrid
//               rows={results.map((r, i) => ({ id: i, ...r }))}
//               columns={columns}
//               pageSize={10}
//               rowsPerPageOptions={[10, 25, 50]}
//               disableSelectionOnClick
//               sortingOrder={["desc", "asc"]}
//               initialState={{
//                 sorting: {
//                   sortModel: [{ field: "totalSold", sort: "desc" }],
//                 },
//               }}
//             />
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// }

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function ImportStockAnalysis() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const columns = [
    { field: "codebar", headerName: "Código de Barra", width: 160 },
    { field: "productName", headerName: "Producto / Operación", flex: 1, minWidth: 220 },
    { field: "rubro", headerName: "Rubro", width: 160 },
    { field: "lastSaleDate", headerName: "Última Venta", width: 140 },
    { field: "totalSold", headerName: "Cantidad Vendida", type: "number", width: 160 },
    { field: "stock", headerName: "Stock Actual", type: "number", width: 130 },
  ];

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (files.length < 2) {
      alert("Selecciona ambos archivos: Movimientos y Stock");
      return;
    }

    setLoading(true);
    try {
      // Leer Movimientos (archivo 0)
      const movBuffer = await files[0].arrayBuffer();
      const wbMov = XLSX.read(movBuffer, { type: "array" });
      const wsMov = wbMov.Sheets[wbMov.SheetNames[0]];
      const movJson = XLSX.utils.sheet_to_json(wsMov);

      // Leer Stock (archivo 1)
      const stockBuffer = await files[1].arrayBuffer();
      const wbStock = XLSX.read(stockBuffer, { type: "array" });
      const wsStock = wbStock.Sheets[wbStock.SheetNames[0]];
      const stockJson = XLSX.utils.sheet_to_json(wsStock);

      // Mapear stock por codebar con cantidad y rubro
      const stockMap = {};
      stockJson.forEach((item) => {
        const codebar = item.Codebar?.toString().trim();
        if (!codebar) return;
        stockMap[codebar] = {
          cantidad: Number(item.Cantidad) || 0,
          rubro: item.Rubro || "Sin rubro",
        };
      });

      const ventaKeywords = [
        "Facturacion",
        "Facturacion FV",
        "Factura",
        "Venta",
        "Transferencia",
        "Envio",
        "Baja",
        "Despacho",
        "Salida",
        "Remito",
        "Pedido",
      ];

      const ventasMap = {};

      movJson.forEach((m) => {
        const codebar = m.Codebar?.toString().trim();
        const operacion = m.Operacion?.toString() || "";
        const cantidad = Number(m.Cantidad) || 0;
        const fechaRaw = m.Fecha || m.Date || "";

        if (!codebar || cantidad >= 0) return;

        const isVenta = ventaKeywords.some((kw) =>
          operacion.toLowerCase().includes(kw.toLowerCase())
        );
        if (!isVenta) return;

        // Soporte para fecha numérica (Excel)
        let fecha = new Date(fechaRaw);
        if (typeof fechaRaw === "number") {
          fecha = XLSX.SSF.parse_date_code(fechaRaw);
          if (fecha) {
            fecha = new Date(Date.UTC(fecha.y, fecha.m - 1, fecha.d));
          }
        }

        if (!ventasMap[codebar]) {
          ventasMap[codebar] = {
            totalSold: 0,
            lastSaleDate: null,
            productName: m.Producto || "",
          };
        }

        ventasMap[codebar].totalSold += Math.abs(cantidad);
        if (!ventasMap[codebar].lastSaleDate || fecha > ventasMap[codebar].lastSaleDate) {
          ventasMap[codebar].lastSaleDate = fecha;
          ventasMap[codebar].productName = m.Producto || ventasMap[codebar].productName;
        }
      });

      const filtered = Object.entries(ventasMap)
        .filter(([codebar]) => {
          const stock = stockMap[codebar]?.cantidad;
          return stock === 0 || stock < 0 || stock === undefined;
        })
        .map(([codebar, data]) => ({
          codebar,
          productName: data.productName,
          rubro: stockMap[codebar]?.rubro || "Sin rubro",
          lastSaleDate: data.lastSaleDate
            ? data.lastSaleDate.toLocaleDateString()
            : "",
          totalSold: data.totalSold,
          stock: stockMap[codebar]?.cantidad ?? 0,
        }))
        .sort((a, b) => b.totalSold - a.totalSold);

      setResults(filtered);
    } catch (error) {
      console.error("Error leyendo archivos:", error);
      alert("Error procesando archivos, revisa consola.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (results.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    const wsData = results.map(
      ({ codebar, productName, rubro, lastSaleDate, totalSold, stock }) => ({
        "Código de Barra": codebar,
        "Producto": productName,
        "Rubro": rubro,
        "Última Venta": lastSaleDate,
        "Cantidad Vendida": totalSold,
        "Stock Actual": stock,
      })
    );

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VentasVsStock");
    XLSX.writeFile(wb, "ventas_vs_stock.xlsx");
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Reporte: Productos vendidos/enviados con stock 0 o negativo
      </Typography>

      <Typography mb={1}>
        Selecciona <strong>dos archivos Excel</strong>: primero el de movimientos, luego el de stock actual.
      </Typography>
      <input
        type="file"
        accept=".xls,.xlsx"
        multiple
        onChange={handleFiles}
        disabled={loading}
      />

      {loading && (
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography>Procesando archivos...</Typography>
        </Box>
      )}

      {results.length > 0 && (
        <>
          <Box mt={3} mb={1} display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Resultados ({results.length})</Typography>
            <Button variant="outlined" onClick={exportToExcel}>
              Exportar a Excel
            </Button>
          </Box>

          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={results.map((r, i) => ({ id: i, ...r }))}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              sortingOrder={["desc", "asc"]}
              initialState={{
                sorting: {
                  sortModel: [{ field: "totalSold", sort: "desc" }],
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
