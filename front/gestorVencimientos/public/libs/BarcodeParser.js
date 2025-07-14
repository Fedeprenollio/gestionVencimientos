// public/libs/BarcodeParser.js
// Parser GS1 mejorado con limpieza de caracteres invisibles

function parseBarcode(data) {
  const result = {};

  // 🧼 Limpiar caracteres invisibles como separadores (GS -> \u001d)
const GS = String.fromCharCode(29);
data = data.split(GS).join("");


  let i = 0;

  while (i < data.length) {
    const ai = data.substring(i, i + 2);
    i += 2;

    if (ai === "01") {
      result.gtin = data.substring(i, i + 14);
      i += 14;
    } else if (ai === "17") {
      const dateStr = data.substring(i, i + 6);
      const y = parseInt(dateStr.slice(0, 2), 10);
      const m = parseInt(dateStr.slice(2, 4), 10);
      const d = parseInt(dateStr.slice(4, 6), 10);
      const fullYear = y >= 50 ? 1900 + y : 2000 + y;
      result.expirationDate = new Date(fullYear, m - 1, d);
      i += 6;
    } else if (ai === "10") {
      let nextMatch = data.slice(i).match(/(21|17|01|90)/);
      const end = nextMatch ? data.indexOf(nextMatch[0], i) : data.length;
      result.batchNumber = data.substring(i, end);
      i = end;
    } else if (ai === "21") {
      let nextMatch = data.slice(i).match(/(10|17|01|90)/);
      const end = nextMatch ? data.indexOf(nextMatch[0], i) : data.length;
      result.serialNumber = data.substring(i, end);
      i = end;
    } else if (ai === "90") {
      result.customCode = data.slice(i);
      break;
    } else {
      // Si el AI no es reconocido, salimos
      break;
    }
  }

  return result;
}

