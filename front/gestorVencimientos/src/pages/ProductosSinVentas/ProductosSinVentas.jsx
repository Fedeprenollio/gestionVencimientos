import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button } from "@mui/material";
import * as XLSX from "xlsx";

export default function ProductosRecibidosSinVentas() {
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);

  // Leer archivos Excel/CSV
  const handleFileUpload = (event, setData) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
      setData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Creamos un mapa de ventas por idproducto para contar unidades
  const ventasMap = useMemo(() => {
    const map = new Map();
    ventas.forEach((v) => {
      const id = String(v.idproducto || v.IDProducto);
      const cantidad = Number(v.UnidadesProd || 0);
      map.set(id, (map.get(id) || 0) + cantidad);
    });
    return map;
  }, [ventas]);

  // Filtramos productos recibidos y sin ventas
  const productosSinVentas = useMemo(() => {
    return compras
      .filter((c) => Number(c.CantRecibidas) > 0) // Solo los que fueron recibidos
      .map((c) => {
        const id = String(c.IDProducto || c.idproducto);
        const unidadesVendidas = ventasMap.get(id) || 0;
        return {
          ...c,
          UnidadesVendidas: unidadesVendidas,
        };
      })
      .filter((p) => p.UnidadesVendidas === 0); // Solo los que NO se vendieron
  }, [compras, ventasMap]);

  const columns = [
    { field: "IDProducto", headerName: "ID Producto", flex: 1 },
    { field: "Producto", headerName: "Producto", flex: 2 },
    {
      field: "CantRecibidas",
      headerName: "Cantidad Recibida",
      flex: 1,
      type: "number",
    },
    {
      field: "UnidadesVendidas",
      headerName: "Unidades Vendidas",
      flex: 1,
      type: "number",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Productos Recibidos pero Sin Ventas
      </Typography>

      {/* Inputs para subir archivos */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" component="label">
          Cargar Compras
          <input
            type="file"
            hidden
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleFileUpload(e, setCompras)}
          />
        </Button>

        <Button variant="contained" component="label">
          Cargar Ventas
          <input
            type="file"
            hidden
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleFileUpload(e, setVentas)}
          />
        </Button>
      </Box>

      {/* Mostrar tabla solo si hay datos */}
      {compras.length > 0 && ventas.length > 0 && (
        <Box sx={{ height: 500, width: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Productos sin ventas: {productosSinVentas.length}
          </Typography>
          <DataGrid
            rows={productosSinVentas}
            columns={columns}
            getRowId={(row) => row.IDProducto || row.idproducto}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Box>
      )}
    </Box>
  );
}
