import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import axios from "axios";
import StockImportHistory from "./StockImportHistory";

export default function CompareAndApplyStockImport({ importId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/imports/compare-stock/${importId}`);
      setRows(res.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Error al comparar stock",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await axios.post(`/api/apply-stock/${importId}`);
      setMessage({
        type: "success",
        text: `Importación aplicada: ${res.data.updatedProducts} actualizados, ${res.data.createdProducts} nuevos productos, ${res.data.updatedStock} stocks actualizados, ${res.data.createdStock} stocks creados.`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Error al aplicar cambios",
      });
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [importId]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comparar Stock Importado vs Base de Datos
      </Typography>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre (Excel)</TableCell>
                <TableCell>Nombre (BD)</TableCell>
                <TableCell>Stock (Excel)</TableCell>
                <TableCell>Stock (BD)</TableCell>
                <TableCell>Precio (Excel)</TableCell>
                <TableCell>Precio (BD)</TableCell>
                <TableCell>Diferencias</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.barcode}</TableCell>
                  <TableCell>{row.nameExcel || "-"}</TableCell>
                  <TableCell>{row.nameDB || "-"}</TableCell>
                  <TableCell>{row.stockExcel ?? "-"}</TableCell>
                  <TableCell>{row.stockDB ?? "-"}</TableCell>
                  <TableCell>${row.priceExcel ?? "-"}</TableCell>
                  <TableCell>${row.priceDB ?? "-"}</TableCell>
                  <TableCell>
                    {row.missingInDB ? (
                      <Alert severity="warning" sx={{ p: 0.5 }}>
                        No existe en BD
                      </Alert>
                    ) : row.match ? (
                      "✓"
                    ) : (
                      "⚠️"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? <CircularProgress size={20} /> : "Aplicar Importación"}
            </Button>
          </Stack>
        </>
      )}
      <StockImportHistory />

    </Paper>
  );
}
