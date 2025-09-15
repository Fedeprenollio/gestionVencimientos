import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import useInventoryStore from "../../store/useInventoryStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Función para exportar a Excel
function exportToExcel({
  data,
  fileName = "export.xlsx",
  sheetName = "Sheet1",
}) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}

// Columnas para la tabla ABC
const columns = [
  { field: "producto", headerName: "Producto", flex: 2 },
  { field: "codebar", headerName: "Código de barras", flex: 1 },
  { field: "stock", headerName: "Stock", type: "number", flex: 0.7 },
  { field: "precio", headerName: "Precio Unitario", type: "number", flex: 1 },
  {
    field: "ventasAnuales",
    headerName: "Ventas Anuales",
    type: "number",
    flex: 1,
  },
  { field: "valorAnual", headerName: "Valor Anual", type: "number", flex: 1 },
  {
    field: "dsi",
    headerName: "DSI (días de inventario)",
    type: "number",
    flex: 1,
  },
  { field: "categoriaABC", headerName: "Categoría ABC", flex: 0.7 },
  {
    field: "porcentajeIndividual",
    headerName: "% Individual",
    type: "number",
    flex: 1,
  },
  {
    field: "porcentajeAcumulado",
    headerName: "% Acumulado",
    type: "number",
    flex: 1,
  },
  { field: "laboratorio", headerName: "Laboratorio", flex: 2 },
  { field: "rubro", headerName: "Rubro", flex: 2 },
  { field: "fechaUltimoPrecio", headerName: "FechaUltimoPrecio", flex: 2 },
];

export default function ABCGrid() {
  const { DSIABC } = useInventoryStore();
  console.log("DSIABC", DSIABC);

  return (
    <Box mt={4}>
      <Typography variant="h6">📊 Análisis ABC de Productos</Typography>

      {!DSIABC?.length ? (
        <Box mt={2}>
          <CircularProgress />
          <Typography variant="body2">Cargando datos...</Typography>
        </Box>
      ) : (
        <>
          <DataGrid
            rows={DSIABC.map((r, i) => ({ id: i, ...r }))}
            columns={columns}
            autoHeight
          />

          <Box mt={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                exportToExcel({
                  data: DSIABC,
                  fileName: `analisis_ABC.xlsx`,
                })
              }
            >
              Exportar a Excel
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
