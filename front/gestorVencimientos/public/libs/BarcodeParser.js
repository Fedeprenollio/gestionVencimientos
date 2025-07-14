// function parseBarcode(data) {
//   const GS = String.fromCharCode(29); // Separador ASCII 29
//   const result = {};

//   // Dividir el código por el carácter GS para obtener segmentos AI+valor
//   const segments = data.split(GS);

//   for (const segment of segments) {
//     if (segment.startsWith("01")) {
//       // GTIN (14 dígitos)
//       result.gtin = segment.substring(2, 16);
//     } else if (segment.startsWith("17")) {
//       // Fecha vencimiento (6 dígitos YYMMDD)
//       const dateStr = segment.substring(2, 8);
//       const y = parseInt(dateStr.slice(0, 2), 10);
//       const m = parseInt(dateStr.slice(2, 4), 10);
//       const d = parseInt(dateStr.slice(4, 6), 10);
//       const fullYear = y >= 50 ? 1900 + y : 2000 + y;
//       result.expirationDate = new Date(fullYear, m - 1, d);
//     } else if (segment.startsWith("10")) {
//       // Lote (variable hasta el siguiente GS)
//       result.batchNumber = segment.substring(2);
//     } else if (segment.startsWith("21")) {
//       // Número de serie (variable)
//       result.serialNumber = segment.substring(2);
//     } else if (segment.startsWith("90")) {
//       // Código personalizado (variable)
//       result.customCode = segment.substring(2);
//     } else {
//       // Puedes manejar otros AIs o ignorar
//     }
//   }

//   return result;
// }

 export function parseBarcode(raw) {
  const result = {};
  let pos = 0;

  while (pos < raw.length) {
    const ai = raw.substr(pos, 2);

    switch (ai) {
      case "01": // GTIN (14)
        result.gtin = raw.substr(pos + 2, 14);
        pos += 16;
        break;

      case "17": // Fecha vencimiento YYMMDD
        { const dateStr = raw.substr(pos + 2, 6);
        const y = parseInt(dateStr.slice(0, 2), 10);
        const m = parseInt(dateStr.slice(2, 4), 10);
        const d = parseInt(dateStr.slice(4, 6), 10);
        const year = y >= 50 ? 1900 + y : 2000 + y;
        result.expirationDate = new Date(year, m - 1, d);
        pos += 8;
        break; }

      case "10": // Lote (variable, hasta que detecte otro AI o final)
        { pos += 2;
        let lote = "";
        while (pos < raw.length && !/^\d{2}/.test(raw.substr(pos, 2))) {
          lote += raw[pos++];
        }
        result.batchNumber = lote;
        break; }

      case "21": // Serie (variable, hasta que detecte otro AI o final)
        { pos += 2;
        let serie = "";
        while (pos < raw.length && !/^\d{2}/.test(raw.substr(pos, 2))) {
          serie += raw[pos++];
        }
        result.serialNumber = serie;
        break; }

      default:
        // Si no se reconoce el AI, avanzar 1 para evitar bucle infinito
        pos += 1;
        break;
    }
  }
  console.log("RESULTADITO",result)
  return result;
}

export function parseGS1Barcode(data) {
  const result = {};
  const GS = String.fromCharCode(29);
  const cleaned = data.replace(/\x1D/g, GS); // aseguramos separadores visibles

  let i = 0;
  while (i < cleaned.length) {
    // Leer 2 o 3 dígitos para AI
    let ai = cleaned.slice(i, i + 2);
    let aiLength = 2;
    if (!["00", "01", "10", "11", "15", "17", "20", "21", "90"].includes(ai)) {
      const ai3 = cleaned.slice(i, i + 3);
      if (["240"].includes(ai3)) {
        ai = ai3;
        aiLength = 3;
      } else {
        // AI desconocido → salir
        break;
      }
    }

    i += aiLength;

    // Obtener valor
    let value = "";
    if (["00", "01"].includes(ai)) {
      value = cleaned.slice(i, i + 18); // SSCC
      if (ai === "01") value = cleaned.slice(i, i + 14); // GTIN
      i += value.length;
    } else if (["11", "15", "17", "20"].includes(ai)) {
      value = cleaned.slice(i, i + 6); // fechas y peso → fijos
      i += 6;
    } else {
      // Variables: cortar en GS o hasta fin
      const nextGS = cleaned.indexOf(GS, i);
      const end = nextGS === -1 ? cleaned.length : nextGS;
      value = cleaned.slice(i, end);
      i = nextGS === -1 ? cleaned.length : end + 1;
    }

    assignAI(result, ai, value);
  }

  return result;
}

function assignAI(obj, ai, value) {
  switch (ai) {
    case "01":
      obj.gtin = value;
      break;
    case "17":
      { const y = parseInt(value.slice(0, 2), 10);
      const m = parseInt(value.slice(2, 4), 10);
      const d = parseInt(value.slice(4, 6), 10);
      const fullYear = y >= 50 ? 1900 + y : 2000 + y;
      obj.expirationDate = new Date(fullYear, m - 1, d);
      break; }
    case "10":
      obj.batchNumber = value;
      break;
    case "21":
      obj.serialNumber = value;
      break;
    case "240":
      obj.customCode = value;
      break;
    case "90":
      obj.internalCode = value;
      break;
    default:
      obj[`AI_${ai}`] = value;
  }
}
