import jsPDF from "jspdf";
import { generateBarcodeImage } from "../generateBarcodeImage";
import dayjs from "dayjs";

// export const generatePDF_Grandes = async ({especiales}) => {
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
//     let nameLines = splitTextByWidth(
//       doc,
//       nombreParaMostrar,
//       etiquetaAncho - 1
//     );

//     const wasTruncated = nameLines.length > 4;
//     nameLines = nameLines.slice(0, 4);

//     if (wasTruncated) {
//       nameLines[3] = nameLines[3].replace(/(.{3,})$/, "$1…");
//     }

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     nameLines.forEach((line, idx) => {
//       doc.text(line, x + 8, y + 25 + idx * 6);
//     });

//     // 🔁 Ajuste vertical según líneas del nombre
//     let offsetY;
//     if (nameLines.length === 1) offsetY = 6;
//     else if (nameLines.length === 2) offsetY = 3;
//     else offsetY = 0;

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
//         y + etiquetaAlto / 2 + 10 - offsetY,
//         { align: "center" }
//       );
//     } else if (["oferta", "liquidacion"].includes(p.tipoEtiqueta)) {
//       const descuento = p.discount ?? 0;
//       const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;
//       // Cantidad de líneas del nombre del producto
//       const nameLineCount = nameLines.length;

//       // Ajustes dinámicos según cantidad de líneas
//       const offsetY =
//         nameLineCount <= 1
//           ? -10
//           : nameLineCount === 2
//           ? -6
//           : nameLineCount === 3
//           ? -2
//           : 0;

//       // Agrandar % OFF
//       doc.setFontSize(20); // tamaño más grande solo para % OFF
//       doc.setTextColor(0);
//       doc.text(`${descuento}% OFF`, x + 8, y + 50 + offsetY);

//       // Volver a tamaño normal para precio anterior
//       doc.setFontSize(15);
//       doc.setTextColor(100);
//       const prevPriceText = `$${prevPrice.toFixed(2)}`;
//       doc.text(prevPriceText, x + 8, y + 56 + offsetY);
//       doc.setLineWidth(0.5);
//       doc.line(
//         x + 8,
//         y + 54.8 + offsetY,
//         x + 8 + doc.getTextWidth(prevPriceText),
//         y + 54.8 + offsetY
//       );

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(priceFontSize);
//       doc.setTextColor(0);
//       doc.text(
//         `$${integerPrice.toFixed(0)}`,
//         x + etiquetaAncho / 2,
//         y + 78 + offsetY,
//         {
//           align: "center",
//         }
//       );
//     }

//     // Código de barras
//     if (p.barcode) {
//       const barcodeImg = generateBarcodeImage(p.barcode);
//       const barcodeY = y + etiquetaAlto - 20;

//       doc.addImage(
//         barcodeImg,
//         "PNG",
//         x + 8,
//         barcodeY,
//         etiquetaAncho - 16,
//         10
//       );
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

export const generatePDF_Clasicas = ({ clasicos }) => {
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

export const generatePDF_Grandes = async ({ especiales, scale = 0.5 }) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // 🔁 Aplico factor de escala
  const etiquetaAncho = 70 * scale;
  const etiquetaAlto = 104 * scale;

  const etiquetasPorFila = Math.floor(210 / (etiquetaAncho + 10)); // ancho A4 = 210mm
  const etiquetasPorColumna = Math.floor(297 / (etiquetaAlto + 10)); // alto A4 = 297mm

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
      doc.addImage(
        logoBase64,
        "PNG",
        x + 5 * scale,
        y + 5 * scale,
        15 * scale,
        15 * scale
      );
    }

const label =
  p.tipoEtiqueta === "oferta"
    ? "OFERTA"
    : p.tipoEtiqueta === "liquidacion"
    ? "LIQUIDACIÓN"
    : p.tipoEtiqueta === "nuevo"
    ? "NUEVO"
    : p.tipoEtiqueta === "recomendado"
    ? "RECOMENDADO"
    : "";

    const labelFontSize = (label === "LIQUIDACIÓN" || label === "RECOMENDADO"   ? 16 : 20) * scale;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(labelFontSize);
    doc.setTextColor(0);
    doc.text(label, x + 23 * scale, y + 15 * scale);

    // Nombre del producto
    const nombreParaMostrar = p.manualName?.trim() || p.name || "";
    let nameLines = splitTextByWidth(doc, nombreParaMostrar, etiquetaAncho - 1);

    const wasTruncated = nameLines.length > 4;
    nameLines = nameLines.slice(0, 4);

    if (wasTruncated) {
      nameLines[3] = nameLines[3].replace(/(.{3,})$/, "$1…");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12 * scale);
    nameLines.forEach((line, idx) => {
      doc.text(line, x + 8 * scale, y + 25 * scale + idx * (6 * scale));
    });

    // Precio
    const price = p.discountedPrice ?? p.currentPrice ?? 0;
    const integerPrice = Math.floor(price);
    const digitCount = integerPrice.toString().length;

    let priceFontSize;
    if (digitCount > 6) priceFontSize = 28;
    else if (digitCount === 6) priceFontSize = 38;
    else if (digitCount === 5) priceFontSize = 40;
    else if (digitCount === 4) priceFontSize = 44;
    else priceFontSize = 60;

    priceFontSize = priceFontSize * scale;

    if (["nuevo", "recomendado"].includes(p.tipoEtiqueta))  {
      doc.setFont("times", "bold");
      doc.setFontSize(priceFontSize);
      doc.setTextColor(0);
      doc.text(
        `$${integerPrice.toFixed(0)}`,
        x + etiquetaAncho / 2,
        y + etiquetaAlto / 2 + 10 * scale,
        { align: "center" }
      );
    } else if (["oferta", "liquidacion"].includes(p.tipoEtiqueta)) {
      const descuento = p.discount ?? 0;
      const prevPrice = p.manualPreviousPrice ?? p.currentPrice ?? 0;

      doc.setFontSize(24 * scale);
      doc.setTextColor(0);
      doc.text(`${descuento}% OFF`, x + 8 * scale, y + 50 * scale);

      doc.setFontSize(18 * scale);
      doc.setTextColor(100);
      const prevPriceText = `$${prevPrice.toFixed(2)}`;
      doc.text(prevPriceText, x + 8 * scale, y + 56 * scale);


      doc.setLineWidth(0.4);
      doc.line(
        x + 8 * scale,
        y + 54.6 * scale,
        x + 8 * scale + doc.getTextWidth(prevPriceText),
        y + 54.8 * scale
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(priceFontSize);
      doc.setTextColor(0);
      doc.text(
        `$${integerPrice.toFixed(0)}`,
        x + etiquetaAncho / 2,
        y + 78 * scale,
        { align: "center" }
      );
    }

    // Código de barras
    if (p.barcode) {
      const barcodeImg = generateBarcodeImage(p.barcode);
      const barcodeY = y + etiquetaAlto - 20 * scale;

      doc.addImage(
        barcodeImg,
        "PNG",
        x + 8 * scale,
        barcodeY,
        etiquetaAncho - 16 * scale,
        10 * scale
      );
      doc.setFontSize(8 * scale);
      doc.setTextColor(80);
      doc.text(p.barcode, x + etiquetaAncho / 2, barcodeY + 12 * scale, {
        align: "center",
      });
    }

    // Fecha
    const fecha = dayjs().format("DD/MM/YYYY");
    doc.setFontSize(7 * scale);
    doc.setTextColor(120);
    doc.text(
      fecha,
      x + etiquetaAncho - 22 * scale,
      y + etiquetaAlto - 4 * scale
    );
  });

  doc.save("etiquetas_especiales.pdf");
};

// // ✅ Funciones públicas
// export const generatePDF_Grandes = async (params) => {
//   const doc = await generatePDF({ ...params, scale: 1 });
//   doc.save("etiquetas_grandes.pdf");
// };

// export const generatePDF_Chicas = async (params) => {
//   const doc = await generatePDF({ ...params, scale: 0.66 });
//   doc.save("etiquetas_chicas.pdf");
// };


export const generatePDF_CartelMixto = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoBase64 = await loadImageBase64("/logo.png");

  // Margen lateral fijo y altura reducida
  const marginX = pageWidth * 0.1;
  let marginY = pageHeight * 0.1;
  const innerWidth = pageWidth - marginX * 2;

  // Achicamos altura un 20%
  let innerHeight = (pageHeight - marginY * 2) * 0.8;
  marginY = (pageHeight - innerHeight) / 2;

  // 🖼 Marco
  doc.setDrawColor(180, 0, 0);
  doc.setLineWidth(3);
  doc.rect(marginX, marginY, innerWidth, innerHeight, "S");

  const offsetY = marginY;

  // Logo más arriba (antes +8 → ahora +4)
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, offsetY + 4, 40, 40);
  }

  // Texto principal más arriba (antes +58 → ahora +52)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(200, 0, 0);
  doc.text("CONSUMO INMEDIATO", pageWidth / 2, offsetY + 52, {
    align: "center",
  });

  // Línea divisoria horizontal (acompaña el título → subo 6 mm)
  const lineY = offsetY + 62;
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(1);
  doc.line(marginX + 10, lineY, marginX + innerWidth - 10, lineY);

  // 🔥 Bloques de descuentos → aún más abajo
  const centerY = offsetY + innerHeight / 2 + 25; // antes +20 → más bajo

  // 60% OFF
  doc.setFontSize(80);
  doc.setTextColor(220, 0, 0);
  doc.text("60%", pageWidth / 2 - 50, centerY, { align: "right" });
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2 - 45, centerY + 14); // leve separación extra

  // 40% OFF
  doc.setFontSize(80);
  doc.setTextColor(255, 128, 0);
  doc.text("40%", pageWidth / 2 + 50, centerY, { align: "left" });
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2 + 45, centerY + 14, { align: "right" });

  // Texto final abajo
  doc.setFontSize(18);
  doc.setTextColor(60);
  doc.setFont("helvetica", "italic");
  doc.text(
    "¡Aprovechá estas promos!",
    pageWidth / 2,
    offsetY + innerHeight - 10,
    { align: "center" }
  );

  doc.save("cartel_consumo_inmediato.pdf");
};

export const generatePDF_Cartel30 = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoBase64 = await loadImageBase64("/logo.png");

  // Margen reducido → cartel más compacto
  const marginX = pageWidth * 0.15;
  const marginY = pageHeight * 0.15;
  const innerWidth = pageWidth - marginX * 2;
  const innerHeight = pageHeight - marginY * 2;

  // Marco
  doc.setDrawColor(180, 0, 0);
  doc.setLineWidth(3);
  doc.rect(marginX, marginY, innerWidth, innerHeight, "S");

  // Logo arriba
  if (logoBase64) {
    doc.addImage(
      logoBase64,
      "PNG",
      pageWidth / 2 - 15,
      marginY + 5,
      30,
      30
    );
  }

  // Texto principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(180, 0, 0);
  doc.text("VENCIMIENTO PRÓXIMO", pageWidth / 2, marginY + 45, {
    align: "center",
  });

  // Descuento grande
  doc.setFontSize(100);
  doc.setTextColor(220, 0, 0);
  doc.text("30%", pageWidth / 2, marginY + innerHeight / 2 + 20, {
    align: "center",
  });

  // OFF debajo del número
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2, marginY + innerHeight / 2 + 50, {
    align: "center",
  });

  doc.save("cartel_30.pdf");
};


export const generatePDF_Cartel20 = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoBase64 = await loadImageBase64("/logo.png");

  const marginX = pageWidth * 0.15;
  const marginY = pageHeight * 0.15;
  const innerWidth = pageWidth - marginX * 2;
  const innerHeight = pageHeight - marginY * 2;

  // Marco (otro color para diferenciar)
  doc.setDrawColor(255, 128, 0);
  doc.setLineWidth(3);
  doc.rect(marginX, marginY, innerWidth, innerHeight, "S");

  // Logo
  if (logoBase64) {
    doc.addImage(
      logoBase64,
      "PNG",
      pageWidth / 2 - 15,
      marginY + 5,
      30,
      30
    );
  }

  // Texto principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 128, 0);
  doc.text("VENCIMIENTO PRÓXIMO", pageWidth / 2, marginY + 45, {
    align: "center",
  });

  // Descuento
  doc.setFontSize(100);
  doc.setTextColor(255, 128, 0);
  doc.text("20%", pageWidth / 2, marginY + innerHeight / 2 + 20, {
    align: "center",
  });

  // OFF
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2, marginY + innerHeight / 2 + 50, {
    align: "center",
  });

  doc.save("cartel_20.pdf");
};


//////


// 🎨 Colores base
// const COLORS = {
//   consumo: { main: [200, 0, 0], secondary: [255, 128, 0] }, // rojo + naranja
//   c30: { main: [220, 0, 0] }, // rojo intenso
//   c20: { main: [255, 128, 0] }, // naranja intenso
// };


export const COLORS = {
  consumo: {
    main: [200, 0, 0],        // Rojo corporativo (para 60%)
    secondary: [255, 130, 0], // Naranja vibrante (para 40%)
  },
  c30: {
    main: [220, 0, 0],        // Rojo más intenso que "consumo"
    bg: [255, 235, 235],      // Fondo rojo claro
  },
  c20: {
    main: [240, 120, 0],      // Naranja elegante
    bg: [255, 245, 230],      // Fondo naranja claro
  },
};


// 🟢 Cartel Consumo Inmediato (60% y 40%)
export const generatePDF_CartelMixtoB = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadImageBase64("/logo.png");

  const marginY = pageHeight * 0.12;
  const innerHeight = pageHeight - marginY * 2;

  // Fondo gris suave
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Marco
  doc.setDrawColor(...COLORS.consumo.main);
  doc.setLineWidth(3);
  doc.rect(10, marginY, pageWidth - 20, innerHeight, "S");

  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, marginY + 5, 40, 40);
  }

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.consumo.main);
  doc.text("CONSUMO INMEDIATO", pageWidth / 2, marginY + 55, { align: "center" });

  // Línea divisoria
  doc.setLineWidth(1);
  doc.line(30, marginY + 65, pageWidth - 30, marginY + 65);

  // Descuentos
  const centerY = marginY + innerHeight / 2 + 20;

  doc.setFontSize(90);
  doc.setTextColor(...COLORS.consumo.main);
  doc.text("60%", pageWidth / 2 - 60, centerY, { align: "right" });
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2 - 50, centerY + 12);

  doc.setFontSize(90);
  doc.setTextColor(...COLORS.consumo.secondary);
  doc.text("40%", pageWidth / 2 + 60, centerY, { align: "left" });
  doc.setFontSize(40);
  doc.text("OFF", pageWidth / 2 + 50, centerY + 12, { align: "right" });

  // Texto extra
  doc.setFontSize(16);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(60);
  doc.text("¡Precios especiales, stock limitado!", pageWidth / 2, marginY + innerHeight - 8, { align: "center" });

  doc.save("cartel_consumo_inmediato.pdf");
};

// 🔴 Cartel -30%
export const generatePDF_Cartel30B = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadImageBase64("/logo.png");

  const marginY = pageHeight * 0.12;
  const innerHeight = pageHeight - marginY * 2;

  // Fondo rojo claro
  doc.setFillColor(255, 235, 235);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Marco
  doc.setDrawColor(...COLORS.c30.main);
  doc.setLineWidth(4);
  doc.rect(10, marginY, pageWidth - 20, innerHeight, "S");

  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, marginY + 5, 40, 40);
  }

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...COLORS.c30.main);
  doc.text("DESCUENTO ESPECIAL", pageWidth / 2, marginY + 55, { align: "center" });

  // Línea divisoria
  doc.setLineWidth(1);
  doc.line(30, marginY + 65, pageWidth - 30, marginY + 65);

  // Texto central
  const centerY = marginY + innerHeight / 2 + 20;
  doc.setFontSize(120);
  doc.text("-30%", pageWidth / 2, centerY, { align: "center" });

  // Texto extra
  doc.setFontSize(20);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80);
  doc.text("Descuento directo en góndola", pageWidth / 2, marginY + innerHeight - 10, { align: "center" });

  doc.save("cartel_30.pdf");
};

// 🟠 Cartel -20%
export const generatePDF_Cartel20B = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadImageBase64("/logo.png");

  const marginY = pageHeight * 0.12;
  const innerHeight = pageHeight - marginY * 2;

  // Fondo naranja claro
  doc.setFillColor(255, 245, 230);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Marco
  doc.setDrawColor(...COLORS.c20.main);
  doc.setLineWidth(4);
  doc.rect(10, marginY, pageWidth - 20, innerHeight, "S");

  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, marginY + 5, 40, 40);
  }

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...COLORS.c20.main);
  doc.text("DESCUENTO ESPECIAL", pageWidth / 2, marginY + 55, { align: "center" });

  // Línea divisoria
  doc.setLineWidth(1);
  doc.line(30, marginY + 65, pageWidth - 30, marginY + 65);

  // Texto central
  const centerY = marginY + innerHeight / 2 + 20;
  doc.setFontSize(120);
  doc.text("-20%", pageWidth / 2, centerY, { align: "center" });

  // Texto extra
  doc.setFontSize(20);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text("Descuento directo en góndola", pageWidth / 2, marginY + innerHeight - 10, { align: "center" });

  doc.save("cartel_20.pdf");
};