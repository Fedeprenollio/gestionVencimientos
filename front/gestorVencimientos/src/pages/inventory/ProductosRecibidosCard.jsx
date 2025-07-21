import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useInventoryStore from "../../store/useInventoryStore";

const ProductosRecibidosCard = () => {
  const productosRecibidos = useInventoryStore((state) => state.productosRecibidos);

  console.log("productosRecibidos", productosRecibidos);

  if (!productosRecibidos || productosRecibidos.length === 0) return null;

  // Columnas del DataGrid
  const columns = [
    {
      field: "nombre",
      headerName: "Producto",
      flex: 1,
    },
    {
      field: "codebar",
      headerName: "Cod. Barras",
      flex: 1,
    },
    {
      field: "cantidad",
      headerName: "Cantidad recibida",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
    },
  ];

  // Aseguramos que cada fila tenga un ID único
  const rows = productosRecibidos.map((item, index) => ({
    id: item.IDProducto || index, // `id` requerido por DataGrid
    ...item,
  }));

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Productos recibidos desde otras sucursales
        </Typography>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            density="compact"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductosRecibidosCard;
