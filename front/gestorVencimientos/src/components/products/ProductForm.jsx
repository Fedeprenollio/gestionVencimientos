import React, { useState, useEffect } from "react";
import axios from "axios";
import BarcodeScanner from "../barcodeScanner/BarcodeScanner.jsx";
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
  Autocomplete,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import dayjs from "dayjs";
import { exportToExcel, exportToExcelLots, formatDate } from "../../../utils/exportUtils.js";

export default function ProductForm({ onAdded, branch }) {
  const [barcode, setBarcode] = useState("");
  const [productExists, setProductExists] = useState(null);
  const [productInfo, setProductInfo] = useState({
    name: "",
    type: "medicamento",
  });
  const [quantity, setQuantity] = useState(1);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [scanning, setScanning] = useState(false);

  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [createdLots, setCreatedLots] = useState(() => {
    const saved = localStorage.getItem("lotes_jornada");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("lotes_jornada", JSON.stringify(createdLots));
  }, [createdLots]);

  const clearLots = () => {
    setCreatedLots([]);
    localStorage.removeItem("lotes_jornada");
  };

  // Buscar productos por nombre
  useEffect(() => {
    if (nameQuery.length < 2) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/search?name=${nameQuery}`
        );
        setNameResults(res.data);
      } catch (err) {
        console.error("Error buscando por nombre:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [nameQuery]);

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
    setProductExists(null);
    setProductInfo({ name: "", type: "medicamento" });
  };

  const handleSearch = async (code) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${code}`
      );
      setProductExists(true);
      setProductInfo({ name: res.data.name, type: res.data.type });
    } catch (err) {
      setProductExists(false);
      setProductInfo({ name: "", type: "medicamento" });
    }
  };

  const handleDetected = (code) => {
    setBarcode(code);
    setScanning(false);
    handleSearch(code);
  };

  const submit = async (e) => {
    e.preventDefault();
    const expirationDate = new Date(`${expYear}-${expMonth}-01`).toISOString();

    const payload = {
      barcode,
      name: productInfo.name,
      type: productInfo.type,
      branch,
      expirationDate,
      quantity: Number(quantity),
    };
    console.log("payload",payload)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/products`,
        payload
      );
      console.log("res.data", res.data);
      // ✅ Agregar lote a la lista local
      // const updatedProduct = res.data; // el producto completo con todos sus lots

          // ✅ Agregar lote a la lista local
          setCreatedLots((prev) => [
            ...prev,
            {
              name: productInfo.name,
              barcode,
              expirationDate,
              quantity,
              branch,
              type: productInfo.type
            },
          ]);
    
    

      // setCreatedLots((prev) => {
      //   const index = prev.findIndex(
      //     (p) => p.barcode === updatedProduct.barcode
      //   );
      //   if (index !== -1) {
      //     // Reemplazar el producto existente (actualizarlo)
      //     const newArr = [...prev];
      //     newArr[index] = updatedProduct;
      //     return newArr;
      //   } else {
      //     // Agregar nuevo producto al array
      //     return [...prev, updatedProduct];
      //   }
      // });

      // reset
      // setBarcode("");
      // setProductExists(null);
      // setProductInfo({ name: "", type: "medicamento" });
      setQuantity(1);
      setExpMonth("");
      setExpYear("");
      // setNameQuery("");
      // setNameResults([]);
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

      {/* Autocompletado por nombre */}
      <Autocomplete
        options={nameResults}
        getOptionLabel={(option) => `${option.name}`}
        onInputChange={(e, newInputValue) => setNameQuery(newInputValue)}
        onChange={(e, selected) => {
          if (selected) {
            setBarcode(selected.barcode);
            setProductExists(true);
            setProductInfo({ name: selected.name, type: selected.type });
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar por nombre"
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      />

      <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs>
          <TextField
            label="Código de barras"
            value={barcode}
            onChange={handleBarcodeChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item>
          <Button
           type="submit"
            variant="outlined"
            onClick={() => handleSearch(barcode)}
            disabled={!barcode}
          >
            Buscar
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => setScanning(true)}>
            Escanear
          </Button>
        </Grid>
      </Grid>

      {scanning && (
        <BarcodeScanner
          onDetected={handleDetected}
          onClose={() => setScanning(false)}
        />
      )}

      {productExists && (
        <Box sx={{ mb: 2 }}>
          <Typography>
            Producto encontrado: <strong>{productInfo.name}</strong> (
            {productInfo.type})
          </Typography>
        </Box>
      )}

      {productExists === false && (
        <>
          <TextField
            label="Nombre"
            value={productInfo.name}
            onChange={(e) =>
              setProductInfo((p) => ({ ...p, name: e.target.value }))
            }
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={productInfo.type}
              onChange={(e) =>
                setProductInfo((p) => ({ ...p, type: e.target.value }))
              }
              label="Tipo"
              required
            >
              <MenuItem value="medicamento">Medicamento</MenuItem>
              <MenuItem value="perfumeria">Perfumería</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {productExists !== null && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* <Grid item xs={6}> */}
            <FormControl sx={{ maxWidth: 200 }} fullWidth variant="outlined">
              <InputLabel id="exp-month-label">Mes</InputLabel>
              <Select
                labelId="exp-month-label"
                id="exp-month"
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
            {/* </Grid> */}

            {/* <Grid item xs={6}> */}
            <FormControl sx={{ maxWidth: 200 }} fullWidth variant="outlined">
              <InputLabel id="exp-year-label">Año</InputLabel>
              <Select
                labelId="exp-year-label"
                id="exp-year"
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
            {/* </Grid> */}
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

      <Button  onClick={submit} variant="contained" fullWidth>
        Guardar
      </Button>
      {createdLots.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Lotes cargados hoy
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Sucursal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {createdLots.map((lot, idx) => (
                <TableRow key={idx}>
                  <TableCell>{lot.name}</TableCell>
                  <TableCell>{lot.barcode}</TableCell>
                  <TableCell>{formatDate(lot.expirationDate)}</TableCell>
                  <TableCell>{lot.quantity}</TableCell>
                  <TableCell>{lot.branch}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => exportToExcelLots(createdLots)}
            >
              Exportar a Excel
            </Button>
            <Button variant="outlined" color="error" onClick={clearLots}>
              Limpiar jornada
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
