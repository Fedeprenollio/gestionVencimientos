import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import BarcodeScanner from "../barcodeScanner/BarcodeScanner";

export default function ProductForm({ onAdded, branch }) {
  const [barcode, setBarcode] = useState("");
  const [productExists, setProductExists] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("medicamento");
  const [quantity, setQuantity] = useState(1);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [scanning, setScanning] = useState(false);
  const handleDetected = (code) => {
    setBarcode(code);
    setScanning(false);
    handleSearch(); // buscar el producto automáticamente
  };

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
    setProductExists(null);
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${barcode}`
      );
      setProductExists(true);
      setName(res.data.name);
      setType(res.data.type);
    } catch (err) {
      setProductExists(false);
      setName("");
      setType("medicamento");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const expirationDate = new Date(
        `${expYear}-${expMonth}-01`
      ).toISOString();
      await axios.post(import.meta.env.VITE_API_URL + "/products", {
        barcode,
        name,
        type,
        branch, // ← lo pasamos desde arriba
        expirationDate,
        quantity: Number(quantity),
      });
      // reset
      setBarcode("");
      setName("");
      setType("medicamento");
      setQuantity(1);
      setExpMonth("");
      setExpYear("");
      setProductExists(null);
      onAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ maxWidth: 500, mx: "auto", p: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        {productExists === null
          ? "Nuevo producto o lote"
          : productExists
          ? "Agregar lote"
          : "Crear nuevo producto"}
      </Typography>

      <TextField
        label="Código de barras"
        value={barcode}
        onChange={handleBarcodeChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <Button
        variant="outlined"
        onClick={() => setScanning(true)}
        fullWidth
        sx={{ mb: 2 }}
        disabled={scanning}
      >
        {scanning ? "Escaneando..." : "Escanear código"}
      </Button>

      {scanning && (
        <BarcodeScanner
          onDetected={handleDetected}
          onClose={() => setScanning(false)}
        />
      )}

      <Button
        variant="outlined"
        onClick={handleSearch}
        fullWidth
        sx={{ mb: 2 }}
        disabled={!barcode}
      >
        Buscar producto
      </Button>

      {/* Si el producto no existe, mostrar campos para crearlo */}
      {productExists === false && (
        <>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Tipo"
              required
            >
              <MenuItem value="medicamento">Medicamento</MenuItem>
              <MenuItem value="perfumeria">Perfumería</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {/* Si ya buscamos (existe o no), mostrar vencimiento + cantidad */}
      {productExists !== null && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  label="Mes"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = String(i + 1).padStart(2, "0");
                    return (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  label="Año"
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Button type="submit" variant="contained" fullWidth>
        Guardar
      </Button>
    </Box>
  );
}
