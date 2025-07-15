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
  DialogTitle,
  Dialog,
  DialogContent,
} from "@mui/material";
import SucursalSelector from "./SucursalSelector.jsx";
import LotForm from "../lots/formularios/LotForm.jsx";
import CreatedLotsTable from "../lots/CreatedLotsTable.jsx";
import BarcodeSearchSection from "../lots/BarcodeSearchSection.jsx";
import useSnackbar from "../../hooks/useSnackbar.js";
import AppSnackbar from "../shared/AppSnackbar.jsx";
import { parseGS1Barcode } from "../../../utils/BarcodeParser.js";

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
  const [branch, setBranch] = useState(() => {
    return localStorage.getItem("selectedBranch") || "sucursal1";
  });

  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [overstock, setOverstock] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const [createdLots, setCreatedLots] = useState(() => {
    const saved = localStorage.getItem("lotes_jornada");
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
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
      setProductInfo((prev) => ({
        ...prev,
        id: res.data._id,
        name: res.data.name,
        type: res.data.type,
      }));
    } catch (err) {
      setProductExists(false);
      setProductInfo({ name: "", type: "medicamento", id: "" });
      setShowCreateModal(true);
    }
  };

  // const handleDetected = (code) => {
  //   setBarcode(code);
  //   setScanning(false);
  //   handleSearch(code);
  // };

  // function parseGS1Barcode(data) {
  //   const result = {};

  //   // Buscar GTIN (01) – 14 dígitos
  //   const matchGTIN = data.match(/01(\d{14})/);
  //   if (matchGTIN) result.gtin = matchGTIN[1];

  //   // Buscar Serie (21) – hasta encontrar otro AI (como 17, 10, espacio)
  //   const matchSerie = data.match(/21([A-Z0-9]+?)(?=17|10|\s|$)/);
  //   if (matchSerie) result.serialNumber = matchSerie[1];

  //   // Buscar vencimiento (17) – 6 dígitos (YYMMDD)
  //   const matchExp = data.match(/17(\d{6})/);
  //   if (matchExp) {
  //     const y = parseInt(matchExp[1].slice(0, 2), 10);
  //     const m = parseInt(matchExp[1].slice(2, 4), 10);
  //     const d = parseInt(matchExp[1].slice(4, 6), 10);
  //     const fullYear = y >= 50 ? 1900 + y : 2000 + y;
  //     result.expirationDate = new Date(fullYear, m - 1, d);
  //   }

  //   // Buscar lote (10) – hasta el final o hasta otro AI
  //   const matchLote = data.match(/10([A-Z0-9]+?)(?=21|17|\s|$)/);
  //   if (matchLote) result.batchNumber = matchLote[1];

  //   return result;
  // }
  //  const parsed = window.parseBarcode("010779083900026721Z4J0WX 1719123110GX4284");
  //       console.log("🧾 Código QR parseado:", parsed);

  // const handleDetected = (code) => {
  //   setScanning(false);

  //   if ( code.length > 20) {
  //     const parsed = window.parseBarcode(code);
  //     console.log("🧾 Código QR parseado:", parsed);

  //     let gtin = parsed.gtin;

  //     if (gtin?.length === 14 && (gtin.startsWith("0") || gtin.startsWith("1"))) {
  //       gtin = gtin.slice(1);
  //     }

  //     if (gtin) {
  //       setBarcode(gtin);
  //       handleSearch(gtin);
  //     } else {
  //       setBarcode(code);
  //       handleSearch(code);
  //     }

  //     if (parsed.expirationDate instanceof Date && !isNaN(parsed.expirationDate)) {
  //       const date = parsed.expirationDate;
  //       setExpMonth(String(date.getMonth() + 1).padStart(2, "0"));
  //       setExpYear(String(date.getFullYear()));
  //     }

  //     setProductInfo((prev) => ({
  //       ...prev,
  //       expirationDate: parsed.expirationDate,
  //       batchNumber: parsed.batchNumber,
  //       serialNumber: parsed.serialNumber,
  //       customCode: parsed.customCode,
  //       gtin,
  //     }));
  //   } else {
  //     setBarcode(code);
  //     handleSearch(code);
  //   }
  // };

  // useEffect(() => {
  //  const prueba1 = parseGS1Barcode("01077980846867622135816181109805017260625")
  //  console.log("prueba1",prueba1)
  //   const prueba2 = parseGS1Barcode("010779534790067217270131216007202701000006026106007")
  //  console.log("prueba2",prueba2)
  // }, [])

  const handleDetected = (code) => {
    setScanning(false);

    if (code.length > 20) {
      const parsed = parseGS1Barcode(code);
      console.log("🧾 Código QR parseado:", parsed);

      let gtin = parsed.gtin;
      if (gtin?.length === 14 && /^[01]/.test(gtin)) {
        gtin = gtin.slice(1);
      }

      if (gtin) {
        setBarcode(gtin);
        handleSearch(gtin);
      } else {
        setBarcode(code);
        handleSearch(code);
      }

      if (
        parsed.expirationDate instanceof Date &&
        !isNaN(parsed.expirationDate)
      ) {
        const date = parsed.expirationDate;
        setExpMonth(String(date.getMonth() + 1).padStart(2, "0"));
        setExpYear(String(date.getFullYear()));
      }

      setProductInfo((prev) => ({
        ...prev,
        expirationDate: parsed.expirationDate,
        batchNumber: parsed.batchNumber,
        serialNumber: parsed.serialNumber,
        gtin,
      }));
    } else {
      setBarcode(code);
      handleSearch(code);
    }
  };

  const submit = async () => {
    try {
      let pid = productInfo.id;

      // Si no existe el producto, crear primero
      if (!productExists) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            name: productInfo.name,
            barcode,
            type: productInfo.type,
          }
        );
        pid = res.data.product._id;
        setProductExists(true);
      }

      // Luego crear el lote
      const expirationDate = new Date(
        `${expYear}-${expMonth}-01`
      ).toISOString();

      const lotePayload = {
        productId: pid,
        expirationDate,
        quantity: Number(quantity),
        branch,
        overstock,
        batchNumber: productInfo.batchNumber,
        serialNumber: productInfo.serialNumber,
      };

      const loteRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/lots`,
        lotePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Lote creado:", loteRes.data);
      // ✅ Agregar lote a la lista local
      const lote = loteRes.data.lot;
      lote.product = {
        name: productInfo.name,
        barcode,
        type: productInfo.type,
      };
      setCreatedLots((prev) => [...prev, lote]);
      // setCreatedLots((prev) => [
      //   ...prev,
      //   {
      //     name: productInfo.name,
      //     barcode,
      //     expirationDate,
      //     quantity,
      //     branch,
      //     type: productInfo.type,
      //     overstock,
      //   },
      // ]);
    } catch (err) {
      console.error("Error:", err);
      alert(err.response?.data?.message || "Error");
    }
  };

  // Crear producto nuevo para el modal
  const crearProducto = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/products`, {
        name: productInfo.name,
        barcode,
        type: productInfo.type,
      });

      setProductInfo((prev) => ({
        ...prev,
        id: res.data.product._id,
      }));
      setProductExists(true);
      setShowCreateModal(false);
      showSnackbar("Pruducto creado correctamente!", "success");
    } catch (err) {
      console.error("Error creando producto:", err);
      showSnackbar("Error al crear producto", "error");
    }
  };

  const handleBranchChange = (value) => {
    setBranch(value);
    localStorage.setItem("selectedBranch", value);
  };

  // const submit = async (e) => {
  //   // e.preventDefault();

  //   let productId = productInfo.id;

  //   // 🟡 Si el producto no existe, primero lo creamos
  //   if (!productExists) {
  //     const resProduct = await axios.post(
  //       `${import.meta.env.VITE_API_URL}/products`,
  //       {
  //         name: productInfo.name,
  //         barcode,
  //         type: productInfo.type,
  //       }
  //     );
  //     productId = resProduct.data._id; // ⬅️ Ahora sí tenemos el ID
  //   }

  //   const expirationDate = new Date(`${expYear}-${expMonth}-01`).toISOString();
  //   const payload = {
  //     barcode,
  //     name: productInfo.name,
  //     type: productInfo.type,
  //     branch,
  //     expirationDate,
  //     quantity: Number(quantity),
  //     productId: productId,
  //     overstock,
  //   };
  //   console.log("productInfo", payload);
  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_API_URL}/lots`,
  //       payload
  //     );
  //     console.log("res.data", res.data);
  //     // ✅ Agregar lote a la lista local
  //     // const updatedProduct = res.data; // el producto completo con todos sus lots

  //     // ✅ Agregar lote a la lista local
  //     setCreatedLots((prev) => [
  //       ...prev,
  //       {
  //         name: productInfo.name,
  //         barcode,
  //         expirationDate,
  //         quantity,
  //         branch,
  //         type: productInfo.type,
  //         overstock,
  //       },
  //     ]);

  //     // reset
  //     setBarcode("");
  //     // setProductExists(null);
  //     // setProductInfo({ name: "", type: "medicamento" });
  //     setQuantity(1);
  //     setExpMonth("");
  //     setExpYear("");
  //     setOverstock(false);

  //     // setNameQuery("");
  //     // setNameResults([]);
  //     // onAdded();
  //     barcodeInputRef.current?.focus();
  //   } catch (err) {
  //     console.log("ERROR,", err);
  //     alert(err.response?.data?.message || "Error");
  //   }
  // };
  console.log("createdLots", createdLots);
  return (
    <Box
      sx={{
        width: "100%",
        pt: 2,
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <SucursalSelector branch={branch} onBranchChange={handleBranchChange} />
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: 700, sm: 900, md: 1000 },
          mx: "auto",
          minHeight: "100vh",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        {/* <Typography variant="h6" gutterBottom>
          {productExists === null
            ? "Nuevo producto o lote"
            : productExists
            ? "Agregar lote"
            : "Crear nuevo producto"}
        </Typography> */}

        <Typography variant="h6" gutterBottom>
          Agregar vencimientos
        </Typography>
        {/* 🔍 FORMULARIO DE BÚSQUEDA */}

        {productInfo?.gtin && (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Datos obtenidos del QR:
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>GTIN:</strong> {productInfo.gtin}
                </Typography>
              </Grid>
              {productInfo.expirationDate && (
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Vencimiento:</strong>{" "}
                    {new Date(productInfo.expirationDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {productInfo.batchNumber && (
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Lote:</strong> {productInfo.batchNumber}
                  </Typography>
                </Grid>
              )}
              {productInfo.serialNumber && (
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>N° de Serie:</strong> {productInfo.serialNumber}
                  </Typography>
                </Grid>
              )}
              {productInfo.customCode && (
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Código personalizado:</strong>{" "}
                    {productInfo.customCode}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

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
          isAddMode={false}
        />

        {productExists && (
          <Box sx={{ mb: 2 }}>
            <Typography>
              Producto encontrado: <strong>{productInfo.name}</strong> (
              {productInfo.type})
            </Typography>
          </Box>
        )}

        {/* 📝 FORMULARIO DE CREACIÓN DE PRODUCTO O LOTE */}
        {productExists === true && (
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
            setBarcode={setBarcode}
            setNameQuery={setNameQuery}
            setNameResults={setNameResults}
            barcodeInputRef={barcodeInputRef}
            setProductExists={setProductExists}
          />
        )}

        {/* Modal para crear producto nuevo */}
        <Dialog
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Crear nuevo producto</DialogTitle>
          <DialogContent>
            <TextField
              label="Código de barra"
              value={barcode}
              disabled
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Nombre"
              value={productInfo.name}
              onChange={(e) =>
                setProductInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              margin="dense"
              autoFocus
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={productInfo.type}
                onChange={(e) =>
                  setProductInfo((prev) => ({ ...prev, type: e.target.value }))
                }
                label="Tipo"
              >
                <MenuItem value="medicamento">Medicamento</MenuItem>
                <MenuItem value="perfumeria">Perfumería</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={crearProducto}>
                Crear producto
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* 🧾 TABLA DE LOTES CREADOS */}
        {createdLots.length > 0 && (
          // <CreatedLotsTable createdLots={createdLots} onClear={clearLots} />
          <CreatedLotsTable
            createdLots={createdLots}
            onClear={clearLots}
            onUpdate={setCreatedLots}
          />
        )}
      </Box>
      <AppSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </Box>
  );
}
