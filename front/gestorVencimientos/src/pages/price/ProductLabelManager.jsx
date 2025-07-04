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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
      );
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
        updated[index].manualPreviousPrice && updated[index].manualPreviousPrice > 0
          ? updated[index].manualPreviousPrice
          : updated[index].manualPrice && updated[index].manualPrice > 0
          ? updated[index].manualPrice
          : updated[index].currentPrice || 0;

      const discount = updated[index].discount || 0;
      updated[index].discountedPrice = Number(
        (basePrice * (1 - discount / 100)).toFixed(2)
      );

      return updated;
    });
  };

  // Eliminar producto individual
  const handleDeleteProduct = (index) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Eliminar todos los productos
  const handleDeleteAll = () => {
    if (window.confirm("¿Seguro que querés eliminar todas las etiquetas?")) {
      setProducts([]);
      localStorage.removeItem("labels_products");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const etiquetaAncho = 50;
    const etiquetaAlto = 30;
    const etiquetasPorFila = 3;
    const etiquetasPorColumna = 8;
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
      const fecha = dayjs().format("DD.MM.YYYY");

      // Nombre truncado
      const maxNameLength = 22;
      let name = p.name || "Producto sin nombre";
      if (name.length > maxNameLength) {
        name = name.slice(0, maxNameLength - 3) + "...";
      }

      const currentPrice = p.currentPrice ?? p.manualPrice ?? 0;
      const discountedPrice = p.discountedPrice ?? currentPrice;
      const integerPrice = Math.floor(discountedPrice);
      const digitCount = integerPrice.toString().length;

      // Posición horizontal dinámica según cantidad de dígitos
      let precioXOffset;
      if (digitCount <= 3) {
        precioXOffset = 26;
      } else if (digitCount === 4) {
        precioXOffset = 28;
      } else if (digitCount === 5) {
        precioXOffset = 30;
      } else {
        precioXOffset = 32;
      }

      // Borde
      doc.setDrawColor(150);
      doc.rect(x, y, etiquetaAncho, etiquetaAlto);

      // Fecha
      doc.setFontSize(6);
      doc.text(fecha, x + etiquetaAncho - 20, y + 5);

      // Nombre
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(name, x + 2, y + 10);

      // % OFF
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text(`${p.discount}% OFF`, x + 2, y + 15);

      // Precio anterior
      const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;

      doc.setFontSize(8);
      doc.setTextColor(100);
      const prevPriceText = `$${prevPrice.toFixed(2)}`;

      doc.text(prevPriceText, x + 2, y + 20);
      const prevWidth = doc.getTextWidth(prevPriceText);
      doc.setLineWidth(0.5);
      doc.line(x + 2, y + 19.5, x + 2 + prevWidth, y + 19.5);

      // Precio nuevo (posición ajustada dinámicamente)
      doc.setFontSize(28);
      doc.setTextColor(0);
      doc.text(`${integerPrice}`, x + etiquetaAncho - precioXOffset, y + 23.1);

      // Código de barras y texto
      if (p.barcode) {
        const barcodeImg = generateBarcodeImage(p.barcode);
        const barcodeHeight = 4;
        const barcodeY = y + 23.5;

        doc.addImage(barcodeImg, "PNG", x + 5, barcodeY, 40, barcodeHeight);

        // Texto del código
        doc.setFontSize(7);
        doc.setTextColor(0);
        const barcodeTextWidth = doc.getTextWidth(p.barcode);
        const barcodeTextX = x + 5 + (40 - barcodeTextWidth) / 2;
        doc.text(p.barcode, barcodeTextX, barcodeY + barcodeHeight + 1.5);
      }

      doc.setTextColor(0);
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

      {products.length > 0 && (
        <Button
          variant="outlined"
          color="error"
          sx={{ mb: 2 }}
          onClick={handleDeleteAll}
        >
          Eliminar todas las etiquetas
        </Button>
      )}

      <Grid container spacing={2}>
        {products.map((p, i) => (
          <Grid item xs={12} md={6} key={p._id}>
            <Paper sx={{ p: 2, position: "relative" }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteProduct(i)}
                sx={{ position: "absolute", top: 4, right: 4 }}
                aria-label="Eliminar etiqueta"
              >
                <DeleteIcon />
              </IconButton>

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
              <TextField
                label="Precio anterior (opcional)"
                type="number"
                value={p.manualPreviousPrice ?? ""}
                onChange={(e) =>
                  updateProductField(
                    i,
                    "manualPreviousPrice",
                    Number(e.target.value)
                  )
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
