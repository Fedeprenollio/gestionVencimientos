import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import * as XLSX from "xlsx";

export default function SearchStockPage() {
  const [pedidoCodigos, setPedidoCodigos] = useState([]);
  const [stockPorVencer, setStockPorVencer] = useState([]);
  const [coincidencias, setCoincidencias] = useState([]);
  const [txtFiles, setTxtFiles] = useState([]);
  const [excelFile, setExcelFile] = useState(null);

const handleTxtUpload = (event) => {
  const files = event.target.files;
  const nombres = Array.from(files).map((f) => f.name);
  setTxtFiles(nombres);

  const allCodigos = [];

  const readAllTxts = Array.from(files).map((file) =>
    file.text().then((text) => {
      const lines = text.split(/\r?\n/);
      lines.forEach((line) => {
        // Extraer solo el código numérico (de 8 a 14 dígitos)
        const match = line.match(/\d{8,14}/);
        if (match) {
          allCodigos.push(match[0].trim());
        }
      });
    })
  );

  Promise.all(readAllTxts).then(() => {
    setPedidoCodigos(allCodigos);
  });
};


  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setExcelFile(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setStockPorVencer(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const cruzarDatos = () => {
    if (!pedidoCodigos.length || !stockPorVencer.length) return;

    const codigosLimpios = pedidoCodigos.map((c) => c.trim());

    const matches = stockPorVencer.filter((item) =>
      codigosLimpios.includes(item.Codigo?.toString().trim())
    );

    setCoincidencias(matches);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Buscar Stock en Sucursales
      </Typography>

      <Typography variant="body1" gutterBottom>
        1. Subí uno o varios archivos TXT con los pedidos del día.
      </Typography>
      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Subir TXT
        <input
          type="file"
          multiple
          accept=".txt"
          hidden
          onChange={handleTxtUpload}
        />
      </Button>
      {txtFiles.length > 0 && (
        <Box mb={2}>
          <Typography variant="body2">Archivos TXT cargados:</Typography>
          {txtFiles.map((name, idx) => (
            <Chip key={idx} label={name} sx={{ mr: 1, mt: 1 }} />
          ))}
          <Typography variant="body2" mt={2}>
            Códigos detectados:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {pedidoCodigos.map((code, i) => (
              <Chip key={i} label={code} size="small" />
            ))}
          </Box>
        </Box>
      )}

      <Typography variant="body1" gutterBottom mt={3}>
        2. Subí archivo Excel con el stock por vencer de todas las sucursales.
      </Typography>
      <Button variant="outlined" component="label" sx={{ mb: 2 }}>
        Subir Excel
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          hidden
          onChange={handleExcelUpload}
        />
      </Button>
      {excelFile && (
        <Typography variant="body2" mb={2}>
          Archivo Excel cargado: <strong>{excelFile}</strong>
        </Typography>
      )}

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        disabled={!pedidoCodigos.length || !stockPorVencer.length}
        onClick={cruzarDatos}
      >
        Buscar coincidencias
      </Button>

      {coincidencias.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Productos pedidos que ya existen en stock por vencer
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Sucursal</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Vencimiento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coincidencias.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.Producto}</TableCell>
                  <TableCell>{item.Codigo}</TableCell>
                  <TableCell>{item.Tipo}</TableCell>
                  <TableCell>{item.Sucursal}</TableCell>
                  <TableCell>{item.Cantidad}</TableCell>
                  <TableCell>{item.Vencimiento}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
