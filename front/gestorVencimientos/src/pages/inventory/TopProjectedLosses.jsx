import React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function getColumns() {
  return [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "stock", headerName: "Stock", width: 100 },
    { field: "ventasAnuales", headerName: "Ventas Anuales", width: 100 },
    {
      field: "unidadesPerdidas",
      headerName: "Unidades sin vender",
      width: 150,
    },
    {
      field: "costo",
      headerName: "Costo Unitario",
      width: 130,
    },
    {
      field: "perdidaProyectada",
      headerName: "Pérdida Proyectada",
      width: 160,
    },
    {
      field: "dsi",
      headerName: "DSI",
      width: 100,
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
        perdidaProyectada: Number(p.unidadesPerdidas) * Number(p.costo || 0),
        unidadesPerdidas: p.unidadesPerdidas.toFixed(0) ?? Number(p.stock),
        ventasAnuales: p.ventasAnuales,
      }))
      .sort((a, b) => b.perdidaProyectada - a.perdidaProyectada)
      .slice(0, 300);
  }, [dsiData]);
  console.log("dsiData", dsiData);

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
