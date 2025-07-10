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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


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
      console.log("PRODUCOTS", products);
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

      const toBarcodeString = (value) => {
        if (typeof value === "number") return value.toFixed(0);
        if (typeof value === "string") return value.trim();
        return "";
      };

      // 1. Limpiar y transformar productos
      const seen = {};
      const normalized = json
        .map((row) => {
          const mainCode = toBarcodeString(row.Codebar);
          const name = row.producto?.trim() || row.Producto?.trim() || "";

          if (!mainCode || !name || seen[mainCode]) return null;
          seen[mainCode] = true;

          const rawAlternates = toBarcodeString(row.CodigosBarra);
          const alternateBarcodes = rawAlternates
            .split("-")
            .map((code) => toBarcodeString(code))
            .filter(
              (code) => code && code !== mainCode && /^[0-9]{8,14}$/.test(code)
            );

          return {
            barcode: mainCode,
            name,
            alternateBarcodes,
          };
        })
        .filter(Boolean);

      // 2. Ordenar alfabéticamente
      normalized.sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      );

      // 3. Verificar existentes
      const barcodes = normalized.map((p) => p.barcode);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/products/check-exist`,
          { barcodes }
        );

        const existing = res.data.existingBarcodes;
        const nuevos = normalized.filter(
          (p) => !existing.includes(p.barcode?.toString())
        );

        const ordered = [...normalized].sort((a, b) => {
          const aExists = existing.includes(a.barcode?.toString());
          const bExists = existing.includes(b.barcode?.toString());
          return aExists - bExists;
        });

        setProducts(ordered);
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

  console.log("NUEVOS,", newProducts);
  const handleImport = () => {
    // const toImport = newProducts.map((p) => ({
    //   barcode: p.Codebar.toString().trim(),
    //   name: p.Producto.trim(),
    // }));
    const toImport = newProducts
      .map((p) => ({
        barcode: p.barcode?.toString().trim(),
        name: p.name?.trim(),
        alternateBarcodes: p.alternateBarcodes || [],
      }))
      .filter((p) => p.barcode && p.name); // opcional, para evitar errores

    console.log("toImport", toImport);
    onImport(toImport);
  };
  console.log("Products", products);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Importar productos desde Excel
      </Typography>

      <Box mt={2}>
        <input
          accept=".xls,.xlsx"
          style={{ display: "none" }}
          id="upload-products"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-products">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Seleccionar archivo Excel
          </Button>
        </label>
        <Typography variant="body2" mt={1} color="text.secondary">
          El archivo debe tener las columnas <strong>Codebar</strong> y{" "}
          <strong>Producto</strong>. Opcional: <strong>CodigosBarra</strong>{" "}
          para alternativos. - LISTA DE STOCK
        </Typography>
      </Box>

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
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Alternativos
                  </TableCell>

                  <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((row, i) => {
                  const isExisting = existingProducts.includes(row.barcode);
                  return (
                    <TableRow key={i}>
                      <TableCell>{row.barcode}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                      <TableCell>
                        {row.alternateBarcodes?.length > 0
                          ? row.alternateBarcodes.join(", ")
                          : "-"}
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
