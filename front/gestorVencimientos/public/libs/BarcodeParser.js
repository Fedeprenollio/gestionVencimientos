function parseBarcode(data) {
  const GS = String.fromCharCode(29); // Separador ASCII 29
  const result = {};

  // Dividir el código por el carácter GS para obtener segmentos AI+valor
  const segments = data.split(GS);

  for (const segment of segments) {
    if (segment.startsWith("01")) {
      // GTIN (14 dígitos)
      result.gtin = segment.substring(2, 16);
    } else if (segment.startsWith("17")) {
      // Fecha vencimiento (6 dígitos YYMMDD)
      const dateStr = segment.substring(2, 8);
      const y = parseInt(dateStr.slice(0, 2), 10);
      const m = parseInt(dateStr.slice(2, 4), 10);
      const d = parseInt(dateStr.slice(4, 6), 10);
      const fullYear = y >= 50 ? 1900 + y : 2000 + y;
      result.expirationDate = new Date(fullYear, m - 1, d);
    } else if (segment.startsWith("10")) {
      // Lote (variable hasta el siguiente GS)
      result.batchNumber = segment.substring(2);
    } else if (segment.startsWith("21")) {
      // Número de serie (variable)
      result.serialNumber = segment.substring(2);
    } else if (segment.startsWith("90")) {
      // Código personalizado (variable)
      result.customCode = segment.substring(2);
    } else {
      // Puedes manejar otros AIs o ignorar
    }
  }

  return result;
}
