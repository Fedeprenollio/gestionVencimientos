// utils/fecha.js
import dayjs from "dayjs";
import * as XLSX from "xlsx";

/**
 * Parsea una fecha que puede estar en formato Excel numérico, texto en formato ISO, o texto tipo DD/MM/YYYY.
 * @param {string|number} fecha - El valor de la celda de fecha.
 * @returns {string} Fecha formateada como YYYY-MM-DD, o cadena vacía si no es válida.
 */
export const parseFecha = (fecha) => {
  if (!fecha) return "";

  if (typeof fecha === "number") {
    const excelDate = XLSX.SSF.parse_date_code(fecha);
    if (excelDate) {
      return dayjs(new Date(excelDate.y, excelDate.m - 1, excelDate.d)).format("YYYY-MM-DD");
    }
  }

  if (typeof fecha === "string") {
    if (dayjs(fecha, "YYYY-MM-DD", true).isValid()) {
      return fecha;
    }
    if (fecha.includes("/")) {
      const [d, m, y] = fecha.split("/");
      return dayjs(`${y}-${m}-${d}`).format("YYYY-MM-DD");
    }
  }

  return "";
};

/**
 * Verifica si una fecha está dentro del rango definido por fromDate y toDate.
 * @param {string} fechaStr - Fecha como string en formato YYYY-MM-DD.
 * @param {object} fromDate - dayjs o null
 * @param {object} toDate - dayjs o null
 * @returns {boolean}
 */
export const isInDateRange = (fechaStr, fromDate, toDate) => {
  if (!fechaStr) return false;
  const date = dayjs(fechaStr);
  if (fromDate && date.isBefore(fromDate, "day")) return false;
  if (toDate && date.isAfter(toDate, "day")) return false;
  return true;
};
