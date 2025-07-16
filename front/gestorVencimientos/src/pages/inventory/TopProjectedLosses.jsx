import React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function getColumns() {
  return [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "stock", headerName: "Stock", width: 100 },
    {
      field: "costo",
      headerName: "Costo Unitario",
      width: 130,
    //   valueFormatter: ({ value }) =>
    //     value === undefined || value === null ? "-" : `$${value.toFixed(2)}`,
    },
    {
      field: "perdidaProyectada",
      headerName: "Pérdida Proyectada",
      width: 160,
    //   valueFormatter: ({ value }) => {
    //     console.log("valueFormatter value:", value);
    //     const num = Number(value);
    //     if (isNaN(num)) return "-";
    //     return `$${num.toFixed(2)}`;
    //   },
    },
    {
      field: "dsi",
      headerName: "DSI",
      width: 100,
    //   valueFormatter: ({ value }) => {
    //     if (value === Infinity) return "∞";
    //     if (typeof value === "number") return value.toFixed(0);
    //     return "-";
    //   },
    },
  ];
}

export default function TopProjectedLosses({ dsiData }) {

  const productosConPerdida = React.useMemo(() => {
    if (!dsiData) return [];
    return dsiData
      .filter((p) => p.dsi === Infinity || p.dsi > 180)
      .map((p) => ({
        ...p,
        perdidaProyectada: Number(p.stock) * Number(p.costo || 0),
      }))
      .sort((a, b) => b.perdidaProyectada - a.perdidaProyectada)
      .slice(0, 300);
  }, [dsiData]);
  console.log(productosConPerdida[0]);

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Top 30 productos con mayor pérdida proyectada por vencimiento
      </Typography>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={productosConPerdida.map((p) => ({ id: p.IDProducto, ...p }))}
          columns={getColumns()}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 30]}
          disableSelectionOnClick
          autoHeight
        />
      </div>
    </Box>
  );
}
