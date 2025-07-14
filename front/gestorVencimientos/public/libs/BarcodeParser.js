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

function parseBarcode(data) {
  const result = {};

  // Normalizar posibles separadores (ASCII 29 → espacio)
  data = data.replace(/\x1D/g, " ");

  // Extraer AI (01) – GTIN 14 dígitos
  const matchGTIN = data.match(/01(\d{14})/);
  if (matchGTIN) result.gtin = matchGTIN[1];

  // AI (17) – fecha vencimiento YYMMDD
  const matchExp = data.match(/17(\d{6})/);
  if (matchExp) {
    const y = parseInt(matchExp[1].slice(0, 2), 10);
    const m = parseInt(matchExp[1].slice(2, 4), 10);
    const d = parseInt(matchExp[1].slice(4, 6), 10);
    const year = y >= 50 ? 1900 + y : 2000 + y;
    result.expirationDate = new Date(year, m - 1, d);
  }

  // AI (10) – lote, termina cuando encuentra otro AI (2 dígitos)
  const matchBatch = data.match(/10([^\s]{1,20}?)(?=\d{2}|$)/);
  if (matchBatch) result.batchNumber = matchBatch[1];

  // AI (21) – número de serie, termina cuando encuentra otro AI (opcional)
  const matchSerie = data.match(/21([^\s]{1,20}?)(?=\d{2}|$)/);
  if (matchSerie) result.serialNumber = matchSerie[1];

  return result;
}
