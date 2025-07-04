import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import api from "../../api/axiosInstance";

export default function QuickStockCount({ listId }) {
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]); // productos contados localmente
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    setError("");
    setMessage("");

    if (!barcode || quantity <= 0) {
      setError("Ingresá un código válido y cantidad mayor a 0");
      return;
    }

    try {
      const res = await api.post(`/stock-count/${listId}/add-product`, {
        barcode,
        quantity: parseInt(quantity),
      });

      // actualizar localmente
      const existingIndex = items.findIndex((item) => item.barcode === barcode);
      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex].quantity += parseInt(quantity);
        setItems(updated);
      } else {
        setItems([...items, { barcode, quantity: parseInt(quantity) }]);
      }

      setMessage("Producto agregado");
      setBarcode("");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al agregar producto");
    }
  };

  return (
    <Box p={3}>
        <h1>SECCION EN DESARROLLO</h1>
      <Typography variant="h5" gutterBottom>
        Recuento rápido de stock
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <Button variant="contained" onClick={handleAdd}>
            Agregar
          </Button>
          {error && <Typography color="error">{error}</Typography>}
          {message && <Typography color="primary">{message}</Typography>}
        </Box>
      </Paper>

      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Productos contados ({items.length})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell align="right">Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(({ barcode, quantity }) => (
                <TableRow key={barcode}>
                  <TableCell>{barcode}</TableCell>
                  <TableCell align="right">{quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
