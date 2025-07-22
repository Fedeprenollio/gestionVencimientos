import React, { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";
import useInventoryStore from "../../store/useInventoryStore";
import { detectarProductosQuePerdieronRotacion } from "../../../utils/calculations";

const columns = [
  { field: "nombre", headerName: "Producto", flex: 2 },
  { field: "rubro", headerName: "Rubro", flex: 1 },
  { field: "stock", headerName: "Stock", type: "number", flex: 0.7 },
  { field: "precio", headerName: "Precio", type: "number", flex: 1 },
  { field: "valorStock", headerName: "Valor en Stock", type: "number", flex: 1 },
  { field: "ventas12a6", headerName: "Ventas 12-6m", type: "number", flex: 1 },
  { field: "ventas0a6", headerName: "Ventas 0-6m", type: "number", flex: 1 },
];

export default function ProductosPerdieronRotacionGrid() {
  const { movimientoPerdido } = useInventoryStore();
console.log("movimientoPerdido",movimientoPerdido)
  // useEffect(() => {
  //   if (movimientos?.length && stock?.length) {
     
  //   }
  // }, [movimientos, stock]);

  return (
    <Box mt={4}>
      <Typography variant="h6">📉 Productos que perdieron rotación</Typography>
      {!movimientoPerdido?.length ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={movimientoPerdido.map((r, i) => ({ id: i, ...r }))}
          columns={columns}
          autoHeight
        />
      )}
    </Box>
  );
}
