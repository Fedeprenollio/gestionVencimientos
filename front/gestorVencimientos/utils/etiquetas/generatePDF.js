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

 export const generatePDF_Clasicas = ({clasicos}) => {
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


 export const generatePDF_Grandes = async ({ especiales, scale = .5 }) => {
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
      doc.addImage(logoBase64, "PNG", x + 5 * scale, y + 5 * scale, 15 * scale, 15 * scale);
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

    const labelFontSize = (label === "LIQUIDACIÓN" ? 16 : 20) * scale;
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

   if (p.tipoEtiqueta === "nuevo") {
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

  doc.setFontSize(20 * scale);
  doc.setTextColor(0);
  doc.text(`${descuento}% OFF`, x + 8 * scale, y + 50 * scale);

  doc.setFontSize(15 * scale);
  doc.setTextColor(100);
  const prevPriceText = `$${prevPrice.toFixed(2)}`;
  doc.text(prevPriceText, x + 8 * scale, y + 56 * scale);
  doc.setLineWidth(0.5);
  doc.line(
    x + 8 * scale,
    y + 54.8 * scale,
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
    doc.text(fecha, x + etiquetaAncho - 22 * scale, y + etiquetaAlto - 4 * scale);
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
