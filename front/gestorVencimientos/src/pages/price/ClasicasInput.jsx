// ClasicasInput.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const ClasicasInput = ({ productos, setProductos, generateBarcodeImage }) => {
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleScan = async () => {
    if (!barcodeInput.trim()) return;
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
      );
      const data = response.data;

      const already = productos.find((p) => p._id === data._id);
      if (!already) {
        const price = data.currentPrice ?? 0;
        setProductos((prev) => [
          ...prev,
          {
            ...data,
            manualPrice: null,
            discount: 0,
            discountedPrice: price,
            tipoEtiqueta: "clasica",
          },
        ]);
      } else {
        alert("Producto ya agregado");
      }
    } catch (err) {
      alert("Producto no encontrado");
    } finally {
      setBarcodeInput("");
    }
  };

  const updateProductField = (index, field, value) => {
    setProductos((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      const base =
        updated[index].manualPreviousPrice && updated[index].manualPreviousPrice > 0
          ? updated[index].manualPreviousPrice
          : updated[index].manualPrice && updated[index].manualPrice > 0
          ? updated[index].manualPrice
          : updated[index].currentPrice || 0;

      const discount = updated[index].discount || 0;
      updated[index].discountedPrice = Number((base * (1 - discount / 100)).toFixed(2));
      return updated;
    });
  };

  const handleDeleteProduct = (index) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="Código de barras"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          fullWidth
        />
        <Button variant="contained" onClick={handleScan}>
          Buscar
        </Button>
      </Box>

      <Grid container spacing={2}>
        {productos.map((p, i) => (
          <Grid item xs={12} md={6} key={p._id}>
            <Paper sx={{ p: 2, position: "relative" }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteProduct(i)}
                sx={{ position: "absolute", top: 4, right: 4 }}
              >
                <DeleteIcon />
              </IconButton>
              <Typography variant="subtitle1">{p.name}</Typography>

              {!p.currentPrice || p.currentPrice <= 0 ? (
                <TextField
                  label="Precio"
                  type="number"
                  value={p.manualPrice || ""}
                  onChange={(e) =>
                    updateProductField(i, "manualPrice", Number(e.target.value))
                  }
                  fullWidth
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body2">
                  Precio actual: ${p.currentPrice.toFixed(2)}
                </Typography>
              )}

              <TextField
                label="% Descuento"
                type="number"
                value={p.discount}
                onChange={(e) =>
                  updateProductField(i, "discount", Number(e.target.value))
                }
                fullWidth
                sx={{ mt: 1 }}
              />
              <TextField
                label="Precio anterior"
                type="number"
                value={p.manualPreviousPrice ?? ""}
                onChange={(e) =>
                  updateProductField(i, "manualPreviousPrice", Number(e.target.value))
                }
                fullWidth
                sx={{ mt: 1 }}
              />

              <Typography variant="body1" sx={{ mt: 1 }}>
                Precio final: <strong>${p.discountedPrice?.toFixed(2)}</strong>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClasicasInput;
