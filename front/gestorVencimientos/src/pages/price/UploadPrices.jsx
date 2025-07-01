import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance"; // tu axios configurado

export default function UploadPrices() {
  const { listId } = useParams();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [data, setData] = useState(null); // Aquí guardamos la respuesta con updated y notUpdated

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setMessage(null);
      setData(null);

      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      const formatted = parsed
        .map((row) => ({
          barcode: String(row.Codebar).trim(),
          price: parseFloat(String(row.Unitario).replace(",", ".")),
        }))
        .filter((p) => p.barcode && !isNaN(p.price));

      // Eliminar duplicados
      const unique = Object.values(
        formatted.reduce((acc, cur) => {
          const key = `${cur.barcode}-${cur.price}`;
          if (!acc[key]) acc[key] = cur;
          return acc;
        }, {})
      );

      const res = await api.post(`/product-lists/${listId}/upload-prices`, {
        products: unique,
      });

    //   setMessage(res.data.message || "Precios cargados correctamente ✅");
      setData(res); // guardamos la respuesta para mostrar las listas
      setFile(null);
    } catch (error) {
      console.error("Error al subir precios:", error);
    //   setMessage("❌ Error al subir el archivo");
      setData(null);
    } finally {
      setUploading(false);
    }
  };
console.log("DATAAAA", data)
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Subir precios para la lista {listId}
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

      {message && (
        <Typography
          variant="subtitle1"
          color={message.includes("Error") ? "error" : "success"}
          mb={2}
        >
          {message}
        </Typography>
      )}

      {data && (
        <>
          <Typography variant="h6">Productos actualizados:</Typography>
          <ul>
            {data.updated.map((p) => (
              <li key={p.barcode}>
                {p.name} ({p.barcode}): ${p.price.toFixed(2)}
              </li>
            ))}
          </ul>

          {data.notUpdated.length > 0 && (
            <>
              <Typography variant="h6" color="error" mt={2}>
                Productos no actualizados (no estaban en la lista):
              </Typography>
              <ul>
                {data.notUpdated.map((p) => (
                  <li key={p.barcode}>
                    {p.barcode}: ${p.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Box>
  );
}
