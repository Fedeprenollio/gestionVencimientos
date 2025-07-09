// ProductLabelManager.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import ClasicasInput from "./ClasicasInput";
import EspecialesInput from "./EspecialesInput";
import EtiquetaPreview from "./EtiquetaPreview";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import dayjs from "dayjs";
import { Modal } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // ícono opcional
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExcelDiscountUploader from "./ExcelDiscountUploader";

const generateBarcodeImage = (text) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    // format: "EAN13",
    displayValue: false,
    height: 20,
  });
  return canvas.toDataURL("image/png");
};

const ProductLabelManager = () => {
  const [clasicos, setClasicos] = useState([]);
  const [especiales, setEspeciales] = useState([]);
  const [tabIndex, setTabIndex] = useState(0); // Estado para la pestaña activa
  // Nuevo estado
  const [openModal, setOpenModal] = useState(false);
  const [updateResults, setUpdateResults] = useState([]);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("labels_clasicos");
    if (saved) setClasicos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("labels_clasicos", JSON.stringify(clasicos));
  }, [clasicos]);

  const handleRemoveEspecial = (index) => {
    setEspeciales((prev) => prev.filter((_, i) => i !== index));
  };
  const generatePDF_Grandes = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const etiquetaAncho = 70;
    const etiquetaAlto = 104;
    const etiquetasPorFila = 2;
    const etiquetasPorColumna = 2;

    const logoBase64 = await loadImageBase64("/logo.png");

    especiales.forEach((p, i) => {
      const col = i % etiquetasPorFila;
      const row = Math.floor(i / etiquetasPorFila) % etiquetasPorColumna;

      if (i > 0 && i % (etiquetasPorFila * etiquetasPorColumna) === 0) {
        doc.addPage();
      }

      const x = 10 + col * (etiquetaAncho + 10);
      const y = 10 + row * (etiquetaAlto + 10);

      // Borde
      doc.setDrawColor(150);
      doc.rect(x, y, etiquetaAncho, etiquetaAlto);

      // Logo
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", x + 5, y + 5, 15, 15);
      }

      // Tipo de etiqueta
      const label =
        p.tipoEtiqueta === "oferta"
          ? "OFERTA"
          : p.tipoEtiqueta === "liquidacion"
          ? "LIQUIDACIÓN"
          : p.tipoEtiqueta === "nuevo"
          ? "NUEVO"
          : "";

      const labelFontSize = label === "LIQUIDACIÓN" ? 16 : 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(labelFontSize);
      doc.setTextColor(0);
      doc.text(label, x + 23, y + 15);

      // Nombre del producto
      const nombreParaMostrar = p.manualName?.trim() || p.name || "";
      let nameLines = splitTextByWidth(
        doc,
        nombreParaMostrar,
        etiquetaAncho - 1
      );

      const wasTruncated = nameLines.length > 4;
      nameLines = nameLines.slice(0, 4);

      if (wasTruncated) {
        nameLines[3] = nameLines[3].replace(/(.{3,})$/, "$1…");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      nameLines.forEach((line, idx) => {
        doc.text(line, x + 8, y + 25 + idx * 6);
      });

      // 🔁 Ajuste vertical según líneas del nombre
      let offsetY;
      if (nameLines.length === 1) offsetY = 6;
      else if (nameLines.length === 2) offsetY = 3;
      else offsetY = 0;

      // Ajuste de tamaño de fuente según cantidad de dígitos en el precio
      const price = p.discountedPrice ?? p.currentPrice ?? 0;
      const integerPrice = Math.floor(price);
      const digitCount = integerPrice.toString().length;

      let priceFontSize;
      if (digitCount > 6) {
        priceFontSize = 28;
      } else if (digitCount === 6) {
        priceFontSize = 38;
      } else if (digitCount === 5) {
        priceFontSize = 40;
      } else if (digitCount === 4) {
        priceFontSize = 44;
      } else {
        priceFontSize = 60;
      }

      if (p.tipoEtiqueta === "nuevo") {
        doc.setFont("times", "bold");
        doc.setFontSize(priceFontSize);
        doc.setTextColor(0);
        doc.text(
          `$${integerPrice.toFixed(0)}`,
          x + etiquetaAncho / 2,
          y + etiquetaAlto / 2 + 10 - offsetY,
          { align: "center" }
        );
      } else if (["oferta", "liquidacion"].includes(p.tipoEtiqueta)) {
        const descuento = p.discount ?? 0;
        const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;
        // Cantidad de líneas del nombre del producto
        const nameLineCount = nameLines.length;

        // Ajustes dinámicos según cantidad de líneas
        const offsetY =
          nameLineCount <= 1
            ? -10
            : nameLineCount === 2
            ? -6
            : nameLineCount === 3
            ? -2
            : 0;

        // Agrandar % OFF
        doc.setFontSize(20); // tamaño más grande solo para % OFF
        doc.setTextColor(0);
        doc.text(`${descuento}% OFF`, x + 8, y + 50 + offsetY);

        // Volver a tamaño normal para precio anterior
        doc.setFontSize(15);
        doc.setTextColor(100);
        const prevPriceText = `$${prevPrice.toFixed(2)}`;
        doc.text(prevPriceText, x + 8, y + 56 + offsetY);
        doc.setLineWidth(0.5);
        doc.line(
          x + 8,
          y + 54.8 + offsetY,
          x + 8 + doc.getTextWidth(prevPriceText),
          y + 54.8 + offsetY
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(priceFontSize);
        doc.setTextColor(0);
        doc.text(
          `$${integerPrice.toFixed(0)}`,
          x + etiquetaAncho / 2,
          y + 78 + offsetY,
          {
            align: "center",
          }
        );
      }

      // Código de barras
      if (p.barcode) {
        const barcodeImg = generateBarcodeImage(p.barcode);
        const barcodeY = y + etiquetaAlto - 20;

        doc.addImage(
          barcodeImg,
          "PNG",
          x + 8,
          barcodeY,
          etiquetaAncho - 16,
          10
        );
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(p.barcode, x + etiquetaAncho / 2, barcodeY + 12, {
          align: "center",
        });
      }

      // Fecha
      const fecha = dayjs().format("DD/MM/YYYY");
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(fecha, x + etiquetaAncho - 22, y + etiquetaAlto - 4);
    });

    doc.save("etiquetas_especiales.pdf");
  };

  const generatePDF_Clasicas = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const etiquetaAncho = 50;
    const etiquetaAlto = 30;
    const etiquetasPorFila = 3;
    const etiquetasPorColumna = 8;
    const margenX = 10;
    const margenY = 10;
    const espacioX = 5;
    const espacioY = 5;

    clasicos.forEach((p, i) => {
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

      let precioXOffset = 26;
      if (digitCount === 4) precioXOffset = 28;
      if (digitCount === 5) precioXOffset = 30;
      if (digitCount >= 6) precioXOffset = 32;

      doc.setDrawColor(150);
      doc.rect(x, y, etiquetaAncho, etiquetaAlto);

      doc.setFontSize(6);
      doc.text(fecha, x + etiquetaAncho - 20, y + 5);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(name, x + 2, y + 10);

      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text(`${p.discount}% OFF`, x + 2, y + 15);

      const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;
      doc.setFontSize(8);
      doc.setTextColor(100);
      const prevPriceText = `$${prevPrice.toFixed(2)}`;
      doc.text(prevPriceText, x + 2, y + 20);
      const prevWidth = doc.getTextWidth(prevPriceText);
      doc.setLineWidth(0.5);
      doc.line(x + 2, y + 19, x + 2 + prevWidth, y + 19);

      doc.setFontSize(28);
      doc.setTextColor(0);
      doc.text(`${integerPrice}`, x + etiquetaAncho - precioXOffset, y + 23.1);

      if (p.barcode) {
        const barcodeImg = generateBarcodeImage(p.barcode);
        const barcodeHeight = 4;
        const barcodeY = y + 23.5;
        doc.addImage(barcodeImg, "PNG", x + 5, barcodeY, 40, barcodeHeight);

        doc.setFontSize(7);
        doc.setTextColor(0);
        const barcodeTextWidth = doc.getTextWidth(p.barcode);
        const barcodeTextX = x + 5 + (40 - barcodeTextWidth) / 2;
        doc.text(p.barcode, barcodeTextX, barcodeY + barcodeHeight + 1.5);
      }

      doc.setTextColor(0);
    });

    doc.save("etiquetas_clasicas.pdf");
  };

  // 🔁 Divide texto sin cortar palabras
  const splitTextByWidth = (doc, text, maxWidth) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? currentLine + " " + word : word;
      const width = doc.getTextWidth(testLine);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // 📦 Cargar imagen como base64 desde /public
  const loadImageBase64 = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const updateEspecialField = (index, field, value) => {
    setEspeciales((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      const base =
        updated[index].manualPreviousPrice &&
        updated[index].manualPreviousPrice > 0
          ? updated[index].manualPreviousPrice
          : updated[index].manualPrice && updated[index].manualPrice > 0
          ? updated[index].manualPrice
          : updated[index].currentPrice || 0;

      const discount = updated[index].discount || 0;
      updated[index].discountedPrice = Number(
        (base * (1 - discount / 100)).toFixed(2)
      );

      return updated;
    });
  };
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [fileData, setFileData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const updatedItems = [];

      // 🔁 Procesar tanto en clásicos como en especiales
      const updateProductos = (productos, setProductos) => {
        const updated = productos.map((p) => {
          const match = data.find(
            (row) =>
              row.Codebar?.toString().trim() === p.barcode?.toString().trim()
          );

          if (match) {
            const newPrice = Number(match.Unitario);
            if (newPrice > 0 && newPrice !== p.currentPrice) {
              updatedItems.push({
                name: p.name,
                old: p.currentPrice,
                new: newPrice,
              });

              return {
                ...p,
                currentPrice: newPrice,
                manualPrice: newPrice,
                discountedPrice: p.discount
                  ? Number((newPrice * (1 - p.discount / 100)).toFixed(2))
                  : newPrice,
              };
            }
          }

          return p;
        });

        setProductos(updated);
      };

      updateProductos(clasicos, setClasicos);
      updateProductos(especiales, setEspeciales);
      setUpdateResults(updatedItems);
      setFileData(data);
    };

    reader.readAsBinaryString(file);
  };
  const handleActualizarPrecios = () => {
    let actualizados = 0;

    const actualizar = (lista, setLista) => {
      const nuevaLista = lista.map((p) => {
        const fila = fileData.find(
          (f) => String(f.codigo)?.trim() === String(p.barcode)?.trim()
        );
        if (fila && fila.precio) {
          actualizados++;
          return {
            ...p,
            currentPrice: Number(fila.precio),
            manualPrice: undefined,
            manualPreviousPrice: undefined,
            discountedPrice:
              p.discount && p.discount > 0
                ? Number(
                    (Number(fila.precio) * (1 - p.discount / 100)).toFixed(2)
                  )
                : undefined, // si no hay descuento, se borra el precio con descuento
          };
        }
        return p;
      });

      setLista(nuevaLista);
    };

    actualizar(clasicos, setClasicos);
    actualizar(especiales, setEspeciales);

    // setOpenUpdateModal(false);
    alert(`Precios actualizados para ${actualizados} productos`);
  };
  console.log("Clasicos", clasicos);
  console.log("Especiales", especiales);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Generador de Etiquetas</Typography>

      {/* Pestañas */}
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Etiquetas Clásicas" />
        <Tab label="Etiquetas Especiales" />
      </Tabs>

      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => setOpenModal(true)}
      >
        Actualizar precios desde Excel
      </Button>
      <Button
        variant="outlined"
        sx={{ mb: 2, ml: 2 }}
        onClick={() => setOpenDiscountModal(true)}
      >
        Cargar descuentos desde Excel
      </Button>

      <ExcelDiscountUploader
        open={openDiscountModal}
        onClose={() => setOpenDiscountModal(false)}
        productos={tabIndex === 0 ? clasicos : especiales}
        setProductos={tabIndex === 0 ? setClasicos : setEspeciales}
        tipoEtiqueta={tabIndex === 0 ? "clasica" : "oferta"}
      />

      {tabIndex === 0 && (
        <Box>
          <Box mt={2}>
            {/* <Typography variant="h6">Etiquetas Clásicas</Typography> */}
            <ClasicasInput
              productos={clasicos}
              setProductos={setClasicos}
              generateBarcodeImage={generateBarcodeImage}
            />
          </Box>
          {clasicos.length > 0 && (
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              onClick={generatePDF_Clasicas}
            >
              Generar PDF de etiquetas clásicas
            </Button>
          )}
        </Box>
      )}
      {/* CLASICAS */}

      {/* <Divider sx={{ my: 4 }} /> */}

      {tabIndex === 1 && (
        <Box>
          {/* ESPECIALES */}
          <Box>
            {/* <Typography variant="h6">Etiquetas Especiales</Typography> */}
            <EspecialesInput
              productos={especiales}
              setProductos={setEspeciales}
            />

            <Grid container spacing={2} mt={2}>
              {especiales.map((p, i) => (
                <Grid item xs={12} md={6} key={p._id}>
                  <EtiquetaPreview
                    producto={p}
                    onChange={(field, value) =>
                      updateEspecialField(i, field, value)
                    }
                    onRemove={() => handleRemoveEspecial(i)}
                  />
                </Grid>
              ))}
            </Grid>

            {especiales.length > 0 && (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 3 }}
                onClick={generatePDF_Grandes}
              >
                Generar PDF de etiquetas especiales
              </Button>
            )}
          </Box>
        </Box>
      )}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Actualizar precios</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Subí un archivo Excel con las columnas <strong>Codebar</strong> y{" "}
            <strong>Unitario</strong>
          </Typography>

          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleActualizarPrecios}
            disabled={fileData.length === 0}
          >
            Aplicar precios del Excel
          </Button>

          {updateResults.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2">Precios actualizados:</Typography>
              <ul>
                {updateResults.map((item, idx) => (
                  <li key={idx}>
                    {item.name} – ${item.old} → ${item.new}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductLabelManager;
