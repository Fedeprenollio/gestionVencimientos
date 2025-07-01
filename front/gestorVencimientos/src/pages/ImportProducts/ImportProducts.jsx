import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

export default function ImportProducts({ onImport }) {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  if (!onImport) {
    // Importador de ejemplo si no se pasa por props
    console.warn("No se pasó onImport, usando comportamiento por defecto");
    const defaultImport = async (products) => {
      try {
         await axios.post(
          `${import.meta.env.VITE_API_URL}/products/import`,
          products
        );
        alert("Productos importados correctamente.");
      } catch (err) {
        console.error("Error al importar productos", err);
        alert("Error al importar productos.");
      }
    };
    // Sobrescribimos onImport para que no explote
    onImport = defaultImport;
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);

      // 1. Filtrar productos únicos
      const seen = {};
      const filtered = json.filter((row) => {
        const codebar = row.Codebar?.toString().trim();
        const name = row.Producto?.trim();
        if (!codebar || !name || seen[codebar]) return false;
        seen[codebar] = name;
        return true;
      });

      // 2. Ordenar alfabéticamente
      filtered.sort((a, b) =>
        a.Producto.localeCompare(b.Producto, "es", { sensitivity: "base" })
      );

      // 3. Chequear cuáles ya existen en la DB
      const barcodes = filtered.map((p) => p.Codebar);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/products/check-exist`,
          {
            barcodes,
          }
        );

        const existing = res.data.existingBarcodes;
        const nuevos = filtered.filter(
          (p) => !existing.includes(p.Codebar?.toString())
        );

        setProducts(filtered);
        setExistingProducts(existing);
        setNewProducts(nuevos);
      } catch (err) {
        console.error("Error al verificar productos existentes", err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    const toImport = newProducts.map((p) => ({
      barcode: p.Codebar.toString().trim(),
      name: p.Producto.trim(),
    }));
    onImport(toImport);
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Importar productos desde Excel
      </Typography>

      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />

      {fileName && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Archivo seleccionado: <strong>{fileName}</strong>
        </Typography>
      )}

      {loading && (
        <Box mt={2}>
          <CircularProgress size={24} />
          <Typography variant="body2">Procesando archivo...</Typography>
        </Box>
      )}

      {!loading && products.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: "bold" }}>
            Vista previa ({products.length} productos únicos)
          </Typography>

          <Paper sx={{ mt: 1, maxHeight: 400, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Codebar</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((row, i) => {
                  const isExisting = existingProducts.includes(
                    row.Codebar?.toString()
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell>{row.Codebar}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {row.Producto}
                      </TableCell>
                      <TableCell>
                        {isExisting ? (
                          <Chip label="Ya existe" color="error" size="small" />
                        ) : (
                          <Chip label="Nuevo" color="success" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImport}
              disabled={newProducts.length === 0}
            >
              Importar {newProducts.length} nuevos productos
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
