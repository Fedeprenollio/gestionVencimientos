import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function MovementAnalyzer() {
  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [reportTitle, setReportTitle] = useState("");

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      analyzeData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    parseExcel(file);
  };

  const analyzeData = (data) => {
    // Guardamos los datos originales para poder filtrar desde los botones
    setRows(data);
  };

  const runReport = (type) => {
    let result = [];
    setReportTitle("");

    if (!rows.length) return;

    const grouped = {};
    for (const row of rows) {
      const id = row.IDProducto;
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(row);
    }

    if (type === "no_ventas") {
      setReportTitle("Productos con ingreso pero sin ventas");
      result = Object.values(grouped)
        .filter((group) =>
          group.some((r) => r.Operacion?.toLowerCase().includes("importación")) &&
          !group.some((r) => r.Operacion?.toLowerCase().includes("facturacion"))
        )
        .map((group) => group[0]);
    }

    if (type === "vencidos") {
      setReportTitle("Productos dados de baja por vencimiento");
      result = rows.filter((r) =>
        r.Operacion?.toLowerCase().includes("vencido")
      );
    }

    if (type === "vencidos_mas_que_ventas") {
      setReportTitle("Productos con más unidades vencidas que vendidas");
      result = Object.values(grouped)
        .filter((group) => {
          const vendidas = group.filter((r) => r.Operacion?.toLowerCase().includes("facturacion"))
            .reduce((acc, r) => acc + Math.abs(Number(r.Cantidad || 0)), 0);
          const vencidas = group.filter((r) => r.Operacion?.toLowerCase().includes("vencido"))
            .reduce((acc, r) => acc + Math.abs(Number(r.Cantidad || 0)), 0);
          return vencidas > vendidas;
        })
        .map((group) => group[0]);
    }

    if (type === "vencido_sin_ventas") {
      setReportTitle("Productos sin ventas y dados de baja por vencimiento");
      result = Object.values(grouped)
        .filter((group) =>
          !group.some((r) => r.Operacion?.toLowerCase().includes("facturacion")) &&
          group.some((r) => r.Operacion?.toLowerCase().includes("vencido"))
        )
        .map((group) => group[0]);
    }

    if (result.length) {
      const cols = Object.keys(result[0]).map((field) => ({
        field,
        headerName: field,
        flex: 1,
        sortable: true,
      }));
      setColumns(cols);
    }
    setRows(result);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Analizador de movimientos de stock
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Subir archivo Excel
          <input type="file" hidden onChange={handleFileUpload} accept=".xls,.xlsx" />
        </Button>
        {fileName && <Typography variant="body2">{fileName}</Typography>}
      </Stack>

      {rows.length > 0 && (
        <Stack spacing={1} direction="row" sx={{ mb: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => runReport("no_ventas")}>Sin ventas</Button>
          <Button variant="outlined" onClick={() => runReport("vencidos")}>Bajas por vencimiento</Button>
          <Button variant="outlined" onClick={() => runReport("vencidos_mas_que_ventas")}>Más vencidas que vendidas</Button>
          <Button variant="outlined" onClick={() => runReport("vencido_sin_ventas")}>Vencido sin ventas</Button>
        </Stack>
      )}

      {reportTitle && (
        <Typography variant="h6" gutterBottom>{reportTitle}</Typography>
      )}

      {rows.length > 0 && columns.length > 0 && (
        <Paper elevation={3} sx={{ height: 600 }}>
          <DataGrid
            rows={rows.map((r, i) => ({ id: i, ...r }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Paper>
      )}
    </Box>
  );
}
