import React, { useState, useEffect, useRef } from "react";
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

import SucursalSelector from "./SucursalSelector.jsx";
import LotForm from "../lots/formularios/LotForm.jsx";
import CreatedLotsTable from "../lots/CreatedLotsTable.jsx";
import BarcodeSearchSection from "../lots/BarcodeSearchSection.jsx";

export default function ProductForm() {
  const [barcode, setBarcode] = useState("");
  const [productExists, setProductExists] = useState(null);
  const [productInfo, setProductInfo] = useState({
    name: "",
    type: "medicamento",
    id: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [scanning, setScanning] = useState(false);
  const [branch, setBranch] = useState("sucursal1");
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [overstock, setOverstock] = useState(false);

  const [createdLots, setCreatedLots] = useState(() => {
    const saved = localStorage.getItem("lotes_jornada");
    return saved ? JSON.parse(saved) : [];
  });
  const barcodeInputRef = useRef(null);

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
    setProductInfo({ name: "", type: "medicamento", id: "" });
  };

  const handleSearch = async (code) => {
    console.log("handleSearch", code);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${code}`
      );
      setProductExists(true);
      setProductInfo({
        id: res.data._id, // o productId si preferís
        name: res.data.name,
        type: res.data.type,
      });
    } catch (err) {
      setProductExists(false);
      setProductInfo({ name: "", type: "medicamento", id: "" });
    }
  };

  const handleDetected = (code) => {
    setBarcode(code);
    setScanning(false);
    handleSearch(code);
  };

  const submit = async (e) => {
    // e.preventDefault();
    const expirationDate = new Date(`${expYear}-${expMonth}-01`).toISOString();
    const payload = {
      barcode,
      name: productInfo.name,
      type: productInfo.type,
      branch,
      expirationDate,
      quantity: Number(quantity),
      productId: productInfo.id,
      overstock,
    };
    console.log("productInfo", payload);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/lots`,
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
          type: productInfo.type,
           overstock,
        },
      ]);

      // reset
      setBarcode("");
      // setProductExists(null);
      // setProductInfo({ name: "", type: "medicamento" });
      setQuantity(1);
      setExpMonth("");
      setExpYear("");
      setOverstock(false);

      // setNameQuery("");
      // setNameResults([]);
      // onAdded();
      barcodeInputRef.current?.focus();
    } catch (err) {
      console.log("ERROR,", err);
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <SucursalSelector branch={branch} setBranch={setBranch} />
      <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {productExists === null
            ? "Nuevo producto o lote"
            : productExists
            ? "Agregar lote"
            : "Crear nuevo producto"}
        </Typography>

        {/* 🔍 FORMULARIO DE BÚSQUEDA */}

        <BarcodeSearchSection
          barcode={barcode}
          setBarcode={setBarcode}
          nameQuery={nameQuery}
          setNameQuery={setNameQuery}
          nameResults={nameResults}
          setProductExists={setProductExists}
          setProductInfo={setProductInfo}
          handleSearch={handleSearch}
          handleDetected={handleDetected}
          scanning={scanning}
          setScanning={setScanning}
          barcodeInputRef={barcodeInputRef}
        />

        {/* <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(barcode);
          }}
        >
          <Autocomplete
            options={nameResults}
            getOptionLabel={(option) => `${option.name}`}
            onInputChange={(e, newInputValue) => setNameQuery(newInputValue)}
            onChange={(e, selected) => {
              if (selected) {
                setBarcode(selected.barcode);
                setProductExists(true);
                setProductInfo({
                  id: selected._id, // o productId
                  name: selected.name,
                  type: selected.type,
                });
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
                inputRef={barcodeInputRef}
              />
            </Grid>
            <Grid item>
              <Button type="submit" variant="outlined" disabled={!barcode}>
                Buscar
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => setScanning(true)}>
                Escanear
              </Button>
            </Grid>
          </Grid>
        </Box>

        {scanning && (
          <BarcodeScanner
            onDetected={handleDetected}
            onClose={() => setScanning(false)}
          />
        )} */}

        {productExists && (
          <Box sx={{ mb: 2 }}>
            <Typography>
              Producto encontrado: <strong>{productInfo.name}</strong> (
              {productInfo.type})
            </Typography>
          </Box>
        )}

        {/* 📝 FORMULARIO DE CREACIÓN DE PRODUCTO O LOTE */}
        {productExists !== null && (
          <LotForm
            productInfo={productInfo}
            setProductInfo={setProductInfo}
            productExists={productExists}
            quantity={quantity}
            setQuantity={setQuantity}
            expMonth={expMonth}
            setExpMonth={setExpMonth}
            expYear={expYear}
            setExpYear={setExpYear}
            branch={branch}
            setBranch={setBranch}
            overstock={overstock}
            setOverstock={setOverstock}
            onSubmit={submit}
          />
        )}

        {/* 🧾 TABLA DE LOTES CREADOS */}
        {createdLots.length > 0 && (
          <CreatedLotsTable createdLots={createdLots} onClear={clearLots} />

          // <Box mt={4}>
          //   <Typography variant="h6" gutterBottom>
          //     Lotes cargados hoy
          //   </Typography>
          //   <Table size="small">
          //     <TableHead>
          //       <TableRow>
          //         <TableCell>Producto</TableCell>
          //         <TableCell>Código</TableCell>
          //         <TableCell>Vencimiento</TableCell>
          //         <TableCell>Cantidad</TableCell>
          //         <TableCell>Sucursal</TableCell>
          //       </TableRow>
          //     </TableHead>
          //     <TableBody>
          //       {createdLots.map((lot, idx) => (
          //         <TableRow key={idx}>
          //           <TableCell>{lot.name}</TableCell>
          //           <TableCell>{lot.barcode}</TableCell>
          //           <TableCell>{formatDate(lot.expirationDate)}</TableCell>
          //           <TableCell>{lot.quantity}</TableCell>
          //           <TableCell>{lot.branch}</TableCell>
          //         </TableRow>
          //       ))}
          //     </TableBody>
          //   </Table>
          //   <Box mt={2} display="flex" gap={2}>
          //     <Button
          //       variant="outlined"
          //       onClick={() => exportToExcelLots(createdLots)}
          //     >
          //       Exportar a Excel
          //     </Button>
          //     <Button variant="outlined" color="error" onClick={clearLots}>
          //       Limpiar jornada
          //     </Button>
          //   </Box>
          // </Box>
        )}
      </Box>
    </>
  );
}
