import * as XLSX from "xlsx";

  export  const parseExcelMonth = (value) => {
    if (value == null || value === "") return "";

    // Caso 1: texto (ej: "Marzo", "Marzo 2026")
    if (typeof value === "string") return value.trim();

    // Caso 2: número de fecha Excel
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      if (!date) return value.toString();

      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const mes = meses[date.m - 1];
      const anio = date.y;

      return mes && anio ? `${mes} ${anio}` : value.toString();
    }

    return value.toString();
  };


