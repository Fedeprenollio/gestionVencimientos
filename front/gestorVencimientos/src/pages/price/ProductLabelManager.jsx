import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import dayjs from "dayjs";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import axios from "axios";

const generateBarcodeImage = (text) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "EAN13",
    displayValue: false,
    height: 20,
  });
  return canvas.toDataURL("image/png");
};

const ProductLabelManager = () => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [products, setProducts] = useState([]);

  // Cargar productos guardados en localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("labels_products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  // Guardar productos en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("labels_products", JSON.stringify(products));
  }, [products]);

  const handleScan = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`);
      const data = response.data;

      const already = products.find((p) => p._id === data._id);
      if (!already) {
        setProducts((prev) => [
          ...prev,
          {
            ...data,
            manualPrice: null,
            discount: 0,
            discountedPrice: data.currentPrice ?? 0,
          },
        ]);
      } else {
        alert("Producto ya agregado");
      }
    } catch (error) {
      alert("Producto no encontrado");
      console.error(error);
    } finally {
      setBarcodeInput("");
    }
  };

  const updateProductField = (index, field, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // Recalcular precio final según base
      const basePrice =
        updated[index].currentPrice && updated[index].currentPrice > 0
          ? updated[index].currentPrice
          : updated[index].manualPrice || 0;
      const discount = updated[index].discount || 0;
      updated[index].discountedPrice = Number(
        (basePrice * (1 - discount / 100)).toFixed(2)
      );

      return updated;
    });
  };

  const generatePDF = () => {
    if (products.length === 0) {
      alert("No hay productos para generar etiquetas");
      return;
    }

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const etiquetasPorFila = 3;
    const etiquetasPorColumna = 8;
    const etiquetaAncho = 50; // 5 cm
    const etiquetaAlto = 30; // 3 cm
    const margenX = 10;
    const margenY = 10;
    const espacioX = 5;
    const espacioY = 5;

    products.forEach((p, i) => {
      const col = i % etiquetasPorFila;
      const fila = Math.floor(i / etiquetasPorFila) % etiquetasPorColumna;

      if (i > 0 && i % (etiquetasPorFila * etiquetasPorColumna) === 0) {
        doc.addPage();
      }

      const x = margenX + col * (etiquetaAncho + espacioX);
      const y = margenY + fila * (etiquetaAlto + espacioY);

      // Fondo y borde etiqueta
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0);
      doc.rect(x, y, etiquetaAncho, etiquetaAlto, "F");
      doc.rect(x, y, etiquetaAncho, etiquetaAlto);

      // Nombre producto
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(String(p.name || "Sin nombre"), x + 3, y + 8, {
        maxWidth: etiquetaAncho - 6,
      });

      // Precio anterior tachado y gris
      const currentPrice = p.currentPrice ?? 0;
      const precioStr = `$${currentPrice.toFixed(2)}`;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(precioStr, x + 3, y + 15);
      const anchoTexto = doc.getTextWidth(precioStr);
      doc.setDrawColor(100);
      doc.setLineWidth(0.7);
      doc.line(x + 3, y + 14, x + 3 + anchoTexto, y + 14);

      // Precio nuevo grande y rojo
      const discountedPrice = p.discountedPrice ?? 0;
      doc.setFontSize(14);
      doc.setTextColor(200, 0, 0);
      doc.text(`$${discountedPrice.toFixed(2)}`, x + 3, y + 25);

      // Fecha etiqueta
      const fecha = dayjs().format("DD/MM/YYYY");
      doc.setFontSize(6);
      doc.setTextColor(50);
      doc.text(`Fecha: ${fecha}`, x + etiquetaAncho - 35, y + etiquetaAlto - 4);

      // Código de barras
      if (p.barcode) {
        const barcodeImg = generateBarcodeImage(p.barcode);
        doc.addImage(barcodeImg, "PNG", x + 10, y + 27, 30, 8);
      }
    });

    doc.save("etiquetas.pdf");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Generador de Etiquetas
      </Typography>

      <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label="Escanear código de barras"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleScan}>
          Buscar
        </Button>
      </Box>

      <Grid container spacing={2}>
        {products.map((p, i) => (
          <Grid item xs={12} md={6} key={p._id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {p.name}
              </Typography>

              {!p.currentPrice || p.currentPrice <= 0 ? (
                <TextField
                  label="Ingresar precio"
                  type="number"
                  value={p.manualPrice || ""}
                  onChange={(e) =>
                    updateProductField(i, "manualPrice", Number(e.target.value))
                  }
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Precio actual: ${p.currentPrice.toFixed(2)}
                </Typography>
              )}

              <TextField
                label="Descuento %"
                type="number"
                value={p.discount}
                onChange={(e) =>
                  updateProductField(i, "discount", Number(e.target.value))
                }
                sx={{ mb: 1 }}
              />

              <Typography variant="body1">
                Precio final: <strong>${p.discountedPrice.toFixed(2)}</strong>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {products.length > 0 && (
        <Button
          variant="contained"
          color="success"
          sx={{ mt: 3 }}
          onClick={generatePDF}
        >
          Generar etiquetas PDF
        </Button>
      )}
    </Box>
  );
};

export default ProductLabelManager;
