import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Input,
} from "@mui/material";

export default function BarcodeSalesAnalyzer() {
  const [sold, setSold] = useState([]);
  const [notSold, setNotSold] = useState([]);
  const [loading, setLoading] = useState(false);

  const tempCodes = JSON.parse(localStorage.getItem("tempBarcodes") || "[]");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const found = {};
      const normalizedCodes = tempCodes.map((c) => c.trim());

      json.forEach((row) => {
        const cb = String(row.Codebar).trim();
        const operacion = String(row.Operacion || "").toLowerCase();
        const cantidad = Number(row.Cantidad || 0);

        if (
          normalizedCodes.includes(cb) &&
          operacion.includes("facturacion")
        ) {
          if (!found[cb]) {
            found[cb] = 0;
          }
          found[cb] += cantidad;
        }
      });

      const vendidos = Object.entries(found).map(([codebar, cantidad]) => ({
        codebar,
        cantidad,
      }));

      const noVendidos = normalizedCodes
        .filter((cb) => !found[cb])
        .map((cb) => ({ codebar: cb }));

      setSold(vendidos);
      setNotSold(noVendidos);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Analizar ventas de códigos cargados
      </Typography>

      <Input
        type="file"
        onChange={handleFileUpload}
        inputProps={{ accept: ".xlsx, .xls" }}
      />
      {loading && <Typography mt={2}>Procesando archivo...</Typography>}

      {sold.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1">Vendidos</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Unidades</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sold.map((s) => (
                <TableRow key={s.codebar}>
                  <TableCell>{s.codebar}</TableCell>
                  <TableCell>{s.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {notSold.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1">No vendidos</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notSold.map((n) => (
                <TableRow key={n.codebar}>
                  <TableCell>{n.codebar}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
