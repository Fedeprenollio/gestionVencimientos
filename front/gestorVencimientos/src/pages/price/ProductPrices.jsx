import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import * as XLSX from "xlsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  getProductsWithoutPrice,
  uploadPriceExcel,
} from "../../api/productApi";

export default function ProductPrices() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [productsWithoutPrice, setProductsWithoutPrice] = useState([]);
  const [historialModal, setHistorialModal] = useState(null); // producto seleccionado

  // Cargar productos sin precio al montar
  useEffect(() => {
    fetchProductsWithoutPrice();
  }, []);

  const fetchProductsWithoutPrice = async () => {
    try {
      const res = await getProductsWithoutPrice();
      setProductsWithoutPrice(res);
    } catch (err) {
      console.error("Error al traer productos sin precio:", err);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      // Formato esperado: [{ barcode, price }]
      // Adaptamos las columnas "Codebar" y "Unitario"
     const formatted = parsed
  .map((row) => ({
    barcode: String(row.Codebar).trim(),
    price: parseFloat(String(row.Precio).replace(",", ".")),
  }))
  .filter((p) => p.barcode && !isNaN(p.price));

// Eliminar duplicados por barcode y price
const unique = Object.values(
  formatted.reduce((acc, cur) => {
    const key = `${cur.barcode}-${cur.price}`;
    if (!acc[key]) acc[key] = cur;
    return acc;
  }, {})
);


        console.log("unique",unique)
      await uploadPriceExcel(unique);

      setFile(null);
      fetchProductsWithoutPrice(); // actualizar lista
      alert("Precios cargados correctamente ✅");
    } catch (err) {
      console.error("Error al subir precios:", err);
      alert("❌ Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Actualizar Precios por Excel
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          border: "2px dashed #ccc",
          p: 3,
          textAlign: "center",
          mb: 4,
        }}
      >
        <CloudUploadIcon fontSize="large" />
        <Typography variant="body1" mb={1}>
          Seleccioná un archivo Excel (.xlsx o .xls) con columnas:{" "}
          <b>barcode</b> y <b>price</b>
        </Typography>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        {file && (
          <Typography variant="body2" mt={1}>
            Archivo seleccionado: {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? <CircularProgress size={20} /> : "Subir precios"}
        </Button>
      </Paper>

      <Typography variant="h6" mb={1}>
        Productos sin precio
      </Typography>
      {productsWithoutPrice?.length === 0 ? (
        <Typography>No hay productos sin precio 🎉</Typography>
      ) : (
        <ul>
          {productsWithoutPrice?.map((p) => (
            <li key={p._id}>
              {p.name} ({p.barcode}){" "}
              <Button
                size="small"
                onClick={() => setHistorialModal(p)}
                variant="outlined"
              >
                Ver historial
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de historial de precios */}
      <Dialog
        open={!!historialModal}
        onClose={() => setHistorialModal(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Historial de precios</DialogTitle>
        <DialogContent dividers>
          {historialModal?.historialPrecios?.length > 0 ? (
            <ul>
              {historialModal.historialPrecios.map((h, i) => (
                <li key={i}>
                  ${h.price} — {new Date(h.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="body2">Sin historial.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistorialModal(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
