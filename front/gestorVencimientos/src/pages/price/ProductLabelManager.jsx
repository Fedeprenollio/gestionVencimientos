// import React, { useState, useEffect } from "react";
// import { jsPDF } from "jspdf";
// import JsBarcode from "jsbarcode";
// import dayjs from "dayjs";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   Grid,
//   IconButton,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import axios from "axios";
// import EtiquetaPreview from "./EtiquetaPreview";

// const generateBarcodeImage = (text) => {
//   const canvas = document.createElement("canvas");
//   JsBarcode(canvas, text, {
//     format: "EAN13",
//     displayValue: false,
//     height: 20,
//   });
//   return canvas.toDataURL("image/png");
// };

// const ProductLabelManager = () => {
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [products, setProducts] = useState([]);
//   const [selectedType, setSelectedType] = useState("clasica");

//   // Cargar productos guardados en localStorage al montar
//   useEffect(() => {
//     const saved = localStorage.getItem("labels_products");
//     if (saved) setProducts(JSON.parse(saved));
//   }, []);

//   // Guardar productos en localStorage cada vez que cambien
//   useEffect(() => {
//     localStorage.setItem("labels_products", JSON.stringify(products));
//   }, [products]);

//   const handleScan = async () => {
//     if (!barcodeInput.trim()) return;

//     try {
//       const response = await axios.get(
//         import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
//       );
//       const data = response.data;

//       const already = products.find((p) => p._id === data._id);
//       if (!already) {
//         setProducts((prev) => [
//           ...prev,
//           {
//             ...data,
//             manualPrice: null,
//             discount: 0,
//             discountedPrice: data.currentPrice ?? 0,
//             tipoEtiqueta: selectedType, // 👈 agregar tipo
//           },
//         ]);
//       } else {
//         alert("Producto ya agregado");
//       }
//     } catch (error) {
//       alert("Producto no encontrado");
//       console.error(error);
//     } finally {
//       setBarcodeInput("");
//     }
//   };

//   const updateProductField = (index, field, value) => {
//     setProducts((prev) => {
//       const updated = [...prev];
//       updated[index][field] = value;

//       // Recalcular precio final según base
//       const basePrice =
//         updated[index].manualPreviousPrice &&
//         updated[index].manualPreviousPrice > 0
//           ? updated[index].manualPreviousPrice
//           : updated[index].manualPrice && updated[index].manualPrice > 0
//           ? updated[index].manualPrice
//           : updated[index].currentPrice || 0;

//       const discount = updated[index].discount || 0;
//       updated[index].discountedPrice = Number(
//         (basePrice * (1 - discount / 100)).toFixed(2)
//       );

//       return updated;
//     });
//   };

//   // Eliminar producto individual
//   const handleDeleteProduct = (index) => {
//     setProducts((prev) => {
//       const updated = [...prev];
//       updated.splice(index, 1);
//       return updated;
//     });
//   };

//   // Eliminar todos los productos
//   const handleDeleteAll = () => {
//     if (window.confirm("¿Seguro que querés eliminar todas las etiquetas?")) {
//       setProducts([]);
//       localStorage.removeItem("labels_products");
//     }
//   };

//   const generatePDF = () => {
//     const doc = new jsPDF({
//       unit: "mm",
//       format: "a4",
//     });

//     const etiquetaAncho = 50;
//     const etiquetaAlto = 30;
//     const etiquetasPorFila = 3;
//     const etiquetasPorColumna = 8;
//     const margenX = 10;
//     const margenY = 10;
//     const espacioX = 5;
//     const espacioY = 5;

//     products.forEach((p, i) => {
//       const col = i % etiquetasPorFila;
//       const fila = Math.floor(i / etiquetasPorFila) % etiquetasPorColumna;
//       if (i > 0 && i % (etiquetasPorFila * etiquetasPorColumna) === 0) {
//         doc.addPage();
//       }

//       const x = margenX + col * (etiquetaAncho + espacioX);
//       const y = margenY + fila * (etiquetaAlto + espacioY);
//       const fecha = dayjs().format("DD.MM.YYYY");

//       // Nombre truncado
//       const maxNameLength = 22;
//       let name = p.name || "Producto sin nombre";
//       if (name.length > maxNameLength) {
//         name = name.slice(0, maxNameLength - 3) + "...";
//       }

//       const currentPrice = p.currentPrice ?? p.manualPrice ?? 0;
//       const discountedPrice = p.discountedPrice ?? currentPrice;
//       const integerPrice = Math.floor(discountedPrice);
//       const digitCount = integerPrice.toString().length;

//       // Posición horizontal dinámica según cantidad de dígitos
//       let precioXOffset;
//       if (digitCount <= 3) {
//         precioXOffset = 26;
//       } else if (digitCount === 4) {
//         precioXOffset = 28;
//       } else if (digitCount === 5) {
//         precioXOffset = 30;
//       } else {
//         precioXOffset = 32;
//       }

//       // Borde
//       doc.setDrawColor(150);
//       doc.rect(x, y, etiquetaAncho, etiquetaAlto);

//       // Fecha
//       doc.setFontSize(6);
//       doc.text(fecha, x + etiquetaAncho - 20, y + 5);

//       // Nombre
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "bold");
//       doc.text(name, x + 2, y + 10);

//       // % OFF
//       doc.setFontSize(8);
//       doc.setTextColor(255, 0, 0);
//       doc.text(`${p.discount}% OFF`, x + 2, y + 15);

//       // Precio anterior
//       const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;

//       doc.setFontSize(8);
//       doc.setTextColor(100);
//       const prevPriceText = `$${prevPrice.toFixed(2)}`;

//       doc.text(prevPriceText, x + 2, y + 20);
//       const prevWidth = doc.getTextWidth(prevPriceText);
//       doc.setLineWidth(0.5);
//       doc.line(x + 2, y + 19.5, x + 2 + prevWidth, y + 19.5);

//       // Precio nuevo (posición ajustada dinámicamente)
//       doc.setFontSize(28);
//       doc.setTextColor(0);
//       doc.text(`${integerPrice}`, x + etiquetaAncho - precioXOffset, y + 23.1);

//       // Código de barras y texto
//       if (p.barcode) {
//         const barcodeImg = generateBarcodeImage(p.barcode);
//         const barcodeHeight = 4;
//         const barcodeY = y + 23.5;

//         doc.addImage(barcodeImg, "PNG", x + 5, barcodeY, 40, barcodeHeight);

//         // Texto del código
//         doc.setFontSize(7);
//         doc.setTextColor(0);
//         const barcodeTextWidth = doc.getTextWidth(p.barcode);
//         const barcodeTextX = x + 5 + (40 - barcodeTextWidth) / 2;
//         doc.text(p.barcode, barcodeTextX, barcodeY + barcodeHeight + 1.5);
//       }

//       doc.setTextColor(0);
//     });

//     doc.save("etiquetas.pdf");
//   };
//   const generatePDF_Grandes = () => {
//     const doc = new jsPDF({ unit: "mm", format: "a4" });

//     const etiquetaAncho = 105; // A6 horizontal
//     const etiquetaAlto = 74; // A6 vertical
//     const margenX = 0;
//     const margenY = 0;

//     const etiquetas = products.filter((p) => p.tipoEtiqueta !== "clasica");

//     etiquetas.forEach((p, i) => {
//       const col = i % 2;
//       const fila = Math.floor(i / 2) % 2;
//       if (i > 0 && i % 4 === 0) {
//         doc.addPage();
//       }

//       const x = margenX + col * etiquetaAncho;
//       const y = margenY + fila * etiquetaAlto;

//       // Colores y estilos según tipo
//       const bgColor =
//         p.tipoEtiqueta === "oferta"
//           ? "#fff176" // amarillo
//           : p.tipoEtiqueta === "liquidacion"
//           ? "#ef5350" // rojo
//           : p.tipoEtiqueta === "nuevo"
//           ? "#81c784" // verde
//           : "#eeeeee";

//       // Fondo
//       doc.setFillColor(bgColor);
//       doc.rect(x, y, etiquetaAncho, etiquetaAlto, "F");

//       // Texto
//       doc.setFontSize(28);
//       doc.setTextColor(0);
//       doc.setFont("helvetica", "bold");

//       const label =
//         p.tipoEtiqueta === "oferta"
//           ? "OFERTA"
//           : p.tipoEtiqueta === "liquidacion"
//           ? "LIQUIDACIÓN"
//           : p.tipoEtiqueta === "nuevo"
//           ? "PRODUCTO NUEVO"
//           : "";

//       doc.text(label, x + 10, y + 25);

//       // Nombre del producto
//       const name = (p.name || "").slice(0, 40);
//       doc.setFontSize(16);
//       doc.text(name, x + 10, y + 40);

//       // Precio
//       const price = p.discountedPrice ?? p.currentPrice ?? 0;
//       doc.setFontSize(36);
//       doc.text(`$${price.toFixed(0)}`, x + 10, y + 65);
//     });

//     doc.save("etiquetas_grandes.pdf");
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h5" gutterBottom>
//         Generador de Etiquetas
//       </Typography>

//       <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 1 }}>
//         <TextField
//           label="Escanear código de barras"
//           value={barcodeInput}
//           onChange={(e) => setBarcodeInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleScan()}
//           sx={{ flexGrow: 1 }}
//         />
//         <Button variant="contained" onClick={handleScan}>
//           Buscar
//         </Button>
//       </Box>

//       {products.length > 0 && (
//         <Button
//           variant="outlined"
//           color="error"
//           sx={{ mb: 2 }}
//           onClick={handleDeleteAll}
//         >
//           Eliminar todas las etiquetas
//         </Button>
//       )}

//       <Grid container spacing={2}>
//         {products.map((p, i) => (
//           <Grid item xs={12} md={6} key={p._id}>
//             <Paper sx={{ p: 2, position: "relative" }}>
//               <IconButton
//                 size="small"
//                 color="error"
//                 onClick={() => handleDeleteProduct(i)}
//                 sx={{ position: "absolute", top: 4, right: 4 }}
//                 aria-label="Eliminar etiqueta"
//               >
//                 <DeleteIcon />
//               </IconButton>

//               <Typography variant="subtitle1" gutterBottom>
//                 {p.name}
//               </Typography>

//               {!p.currentPrice || p.currentPrice <= 0 ? (
//                 <TextField
//                   label="Ingresar precio"
//                   type="number"
//                   value={p.manualPrice || ""}
//                   onChange={(e) =>
//                     updateProductField(i, "manualPrice", Number(e.target.value))
//                   }
//                   sx={{ mb: 1 }}
//                 />
//               ) : (
//                 <Typography variant="body2" sx={{ mb: 1 }}>
//                   Precio actual: ${p.currentPrice.toFixed(2)}
//                 </Typography>
//               )}

//               <TextField
//                 label="Descuento %"
//                 type="number"
//                 value={p.discount}
//                 onChange={(e) =>
//                   updateProductField(i, "discount", Number(e.target.value))
//                 }
//                 sx={{ mb: 1 }}
//               />
//               <TextField
//                 label="Precio anterior (opcional)"
//                 type="number"
//                 value={p.manualPreviousPrice ?? ""}
//                 onChange={(e) =>
//                   updateProductField(
//                     i,
//                     "manualPreviousPrice",
//                     Number(e.target.value)
//                   )
//                 }
//                 sx={{ mb: 1 }}
//               />

//               <Typography variant="body1">
//                 Precio final: <strong>${p.discountedPrice.toFixed(2)}</strong>
//               </Typography>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>

//       {products.length > 0 && (
//         <Button
//           variant="contained"
//           color="success"
//           sx={{ mt: 3 }}
//           onClick={generatePDF}
//         >
//           Generar etiquetas PDF
//         </Button>
//       )}
//       <EtiquetaPreview
//         selectedType={selectedType}
//         onSelectType={(tipo) => setSelectedType(tipo)}
//       />
//     </Box>
//   );
// };

// export default ProductLabelManager;

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
  const [clasicos, setClasicos] = useState([]);
  const [especiales, setEspeciales] = useState([]);
  const [tabIndex, setTabIndex] = useState(0); // Estado para la pestaña activa

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
      const nameLines = splitTextByWidth(
        doc,
        nombreParaMostrar,
        etiquetaAncho - 5
      );

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
          y + 54.8+ offsetY
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

  // const generatePDF_Grandes = async () => {
  //   const doc = new jsPDF({ unit: "mm", format: "a4" });

  //   const etiquetaAncho = 70;
  //   const etiquetaAlto = 104;
  //   const etiquetasPorFila = 2;
  //   const etiquetasPorColumna = 2;

  //   const logoBase64 = await loadImageBase64("/logo.png");

  //   especiales.forEach((p, i) => {
  //     const col = i % etiquetasPorFila;
  //     const row = Math.floor(i / etiquetasPorFila) % etiquetasPorColumna;

  //     if (i > 0 && i % (etiquetasPorFila * etiquetasPorColumna) === 0) {
  //       doc.addPage();
  //     }

  //     const x = 10 + col * (etiquetaAncho + 10);
  //     const y = 10 + row * (etiquetaAlto + 10);

  //     // Borde
  //     doc.setDrawColor(150);
  //     doc.rect(x, y, etiquetaAncho, etiquetaAlto);

  //     // Logo
  //     if (logoBase64) {
  //       doc.addImage(logoBase64, "PNG", x + 5, y + 5, 15, 15);
  //     }

  //     // Tipo de etiqueta
  //     const label =
  //       p.tipoEtiqueta === "oferta"
  //         ? "OFERTA"
  //         : p.tipoEtiqueta === "liquidacion"
  //         ? "LIQUIDACIÓN"
  //         : p.tipoEtiqueta === "nuevo"
  //         ? "NUEVO"
  //         : "";

  //     const labelFontSize = label === "LIQUIDACIÓN" ? 16 : 20;
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(labelFontSize);
  //     doc.setTextColor(0);
  //     doc.text(label, x + 23, y + 15);

  //     // Nombre del producto
  //     const nombreParaMostrar = p.manualName?.trim() || p.name || "";
  //     const nameLines = splitTextByWidth(
  //       doc,
  //       nombreParaMostrar,
  //       etiquetaAncho - 5
  //     );
  //     console.log("nameLines",nameLines)
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(12);
  //     nameLines.forEach((line, idx) => {
  //       doc.text(line, x + 8, y + 25 + idx * 6);
  //     });

  //     // Ajuste de tamaño de fuente según cantidad de dígitos en el precio
  //     const price = p.discountedPrice ?? p.currentPrice ?? 0;
  //     const integerPrice = Math.floor(price);
  //     const digitCount = integerPrice.toString().length;

  //     let priceFontSize;
  //     if (digitCount > 6) {
  //       priceFontSize = 28;
  //     } else if (digitCount === 6) {
  //       priceFontSize = 38;
  //     } else if (digitCount === 5) {
  //       priceFontSize = 40;
  //     } else if (digitCount === 4) {
  //       priceFontSize = 44;
  //     } else {
  //       priceFontSize = 60;
  //     }

  //     if (p.tipoEtiqueta === "nuevo") {
  //       doc.setFont("times", "bold");
  //       doc.setFontSize(priceFontSize);
  //       doc.setTextColor(0);
  //       doc.text(
  //         `$${integerPrice.toFixed(0)}`,
  //         x + etiquetaAncho / 2,
  //         y + etiquetaAlto / 2 + 10,
  //         { align: "center" }
  //       );
  //     } else if (["oferta", "liquidacion"].includes(p.tipoEtiqueta)) {
  //       // % OFF y precio anterior
  //       const descuento = p.discount ?? 0;
  //       const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;

  //       doc.setFontSize(14);
  //       doc.setTextColor(0);
  //       doc.text(`${descuento}% OFF`, x + 8, y + 50);

  //       const prevText = `$${prevPrice.toFixed(2)}`;
  //       const prevWidth = doc.getTextWidth(prevText);
  //       doc.text(prevText, x + 8, y + 56);
  //       doc.setLineWidth(0.5);
  //       doc.line(x + 8, y + 55.5, x + 8 + prevWidth, y + 55.5);

  //       doc.setFont("times", "bold");
  //       doc.setFontSize(priceFontSize);
  //       doc.setTextColor(0);
  //       doc.text(`$${integerPrice.toFixed(0)}`, x + etiquetaAncho / 2, y + 78, {
  //         align: "center",
  //       });
  //     }

  //     // Código de barras
  //     if (p.barcode) {
  //       const barcodeImg = generateBarcodeImage(p.barcode);
  //       const barcodeY = y + etiquetaAlto - 20;

  //       doc.addImage(barcodeImg, "PNG", x + 8, barcodeY, etiquetaAncho - 16, 10);
  //       doc.setFontSize(8);
  //       doc.setTextColor(80);
  //       doc.text(p.barcode, x + etiquetaAncho / 2, barcodeY + 12, {
  //         align: "center",
  //       });
  //     }

  //     // Fecha
  //     const fecha = dayjs().format("DD/MM/YYYY");
  //     doc.setFontSize(7);
  //     doc.setTextColor(120);
  //     doc.text(fecha, x + etiquetaAncho - 22, y + etiquetaAlto - 4);
  //   });

  //   doc.save("etiquetas_especiales.pdf");
  // };

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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Generador de Etiquetas</Typography>

      {/* Pestañas */}
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Etiquetas Clásicas" />
        <Tab label="Etiquetas Especiales" />
      </Tabs>

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
                    onChange={(field, value) => {
                      const updated = [...especiales];
                      updated[i][field] = value;

                      const base =
                        updated[i].manualPreviousPrice &&
                        updated[i].manualPreviousPrice > 0
                          ? updated[i].manualPreviousPrice
                          : updated[i].manualPrice && updated[i].manualPrice > 0
                          ? updated[i].manualPrice
                          : updated[i].currentPrice || 0;

                      const discount = updated[i].discount || 0;
                      updated[i].discountedPrice = Number(
                        (base * (1 - discount / 100)).toFixed(2)
                      );

                      setEspeciales(updated);
                    }}
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
    </Box>
  );
};

export default ProductLabelManager;
