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
      };

      const loteRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/lots`,
        lotePayload
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

  return (
    <Box
      sx={{
        width: "100%",
        pt: 2,
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <SucursalSelector branch={branch} setBranch={setBranch} />
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
          // <CreatedLotsTable createdLots={createdLots} onClear={clearLots} />
          <CreatedLotsTable
            createdLots={createdLots}
            onClear={clearLots}
            onUpdate={setCreatedLots}
          />
        )}
      </Box>
    </Box>
  );
}
