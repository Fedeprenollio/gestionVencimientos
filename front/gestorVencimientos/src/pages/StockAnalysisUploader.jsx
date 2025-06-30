import React, { useState } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isCompraValida, isVenta } from "../../utils/operaciones";
import { isInDateRange, parseFecha } from "../../utils/fechaExcel";

export default function MovementAnalyzer() {
  const [fileName, setFileName] = useState(null);
  const [originalRows, setOriginalRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [reportTitle, setReportTitle] = useState("");

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const parseExcel = (file) => {

    // reader.onload = (e) => {
    //   const data = new Uint8Array(e.target.result);
    //   const workbook = XLSX.read(data, { type: "array" });
    //   const sheet = workbook.Sheets[workbook.SheetNames[0]];
    //   const json = XLSX.utils.sheet_to_json(sheet);

    //   const parsed = json.map((r) => {
    //     const fecha = r.Fecha;
    //     let parsedFecha = "";

    //     if (typeof fecha === "number") {
    //       const excelDate = XLSX.SSF.parse_date_code(fecha);
    //       if (excelDate) {
    //         parsedFecha = dayjs(
    //           new Date(excelDate.y, excelDate.m - 1, excelDate.d)
    //         ).format("YYYY-MM-DD");
    //       }
    //     } else if (typeof fecha === "string") {
    //       if (dayjs(fecha, "YYYY-MM-DD", true).isValid()) {
    //         parsedFecha = fecha;
    //       } else if (fecha.includes("/")) {
    //         const [d, m, y] = fecha.split("/");
    //         parsedFecha = dayjs(`${y}-${m}-${d}`).format("YYYY-MM-DD");
    //       }
    //     }

    //     const op = (r.Operacion || "").toLowerCase();
    //     const cantidad = Number(r.Cantidad || 0);

    //     let tipo = "Otro";

    //     if (
    //       (op.includes("importación") ||
    //         op.includes("recepcion de envio") ||
    //         op.includes("recepción de envio") ||
    //         op.includes("recepción desde eslabon anterior")) &&
    //       !op.includes("devolución") &&
    //       !op.includes("vencimiento") &&
    //       !op.includes("envio") &&
    //       !op.includes("baja") &&
    //       !op.includes("anulacion") &&
    //       !op.includes("edicion") &&
    //       cantidad > 0
    //     ) {
    //       tipo = "Compra válida";
    //     } else if (
    //       op.includes("facturacion") ||
    //       op.includes("dispensacion al paciente")
    //     ) {
    //       tipo = "Venta";
    //     } else if (
    //       op.includes("devolución") ||
    //       op.includes("vencimiento") ||
    //       op.includes("envio") ||
    //       op.includes("baja") ||
    //       op.includes("anulacion")
    //     ) {
    //       tipo = "Excluida";
    //     }

    //     return {
    //       ...r,
    //       Fecha: parsedFecha || "",
    //       TipoOperacion: tipo,
    //     };
    //   });

    //   setOriginalRows(parsed);
    //   setFilteredRows(parsed);
    // };
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const parsed = json.map((r) => {
        const parsedFecha = parseFecha(r.Fecha);

        const op = (r.Operacion || "").toLowerCase();
        const cantidad = Number(r.Cantidad || 0);

        let tipo = "Otro";

        if (isCompraValida(op, cantidad)) {
          tipo = "Compra válida";
        } else if (isVenta(op)) {
          tipo = "Venta";
        } else if (
          op.includes("devolución") ||
          op.includes("vencimiento") ||
          op.includes("envio") ||
          op.includes("baja") ||
          op.includes("anulacion")
        ) {
          tipo = "Excluida";
        }

        return {
          ...r,
          Fecha: parsedFecha || "",
          TipoOperacion: tipo,
        };
      });

      setOriginalRows(parsed);
      setFilteredRows(parsed);
    };
    reader.readAsArrayBuffer(file);

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    parseExcel(file);
  };

  //   const isInDateRange = (fechaStr) => {
  //     if (!fechaStr) return false;
  //     const date = dayjs(fechaStr);
  //     if (fromDate && date.isBefore(fromDate, "day")) return false;
  //     if (toDate && date.isAfter(toDate, "day")) return false;
  //     return true;
  //   };

  const applyDateFilter = () => {
    setFilteredRows([...originalRows]); // Reset to full data
    setReportTitle(""); // Clear report
    setColumns([]);
  };

  const runReport = (type) => {
    if (!originalRows.length) return;

    const grouped = {};
    for (const row of originalRows) {
      const id = row.IDProducto;
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(row);
    }

    let result = [];
    setReportTitle("");

    if (type === "no_ventas") {
      setReportTitle("Productos con ingreso (en el rango) pero sin ventas");

      result = Object.values(grouped)
        .filter((group) => {
          const comprasEnRango = group.some(
            (r) =>
              isCompraValida(r.Operacion, r.Cantidad) && isInDateRange(r.Fecha)
          );
          const tieneVentas = group.some((r) => isVenta(r.Operacion));
          return comprasEnRango && !tieneVentas;
        })
        .map(
          (group) =>
            group.find((r) => r.TipoOperacion === "Compra válida") || null
        )
        .filter(Boolean);
    }

    if (type === "vencidos") {
      setReportTitle("Productos dados de baja por vencimiento");
      result = originalRows.filter((r) =>
        r.Operacion?.toLowerCase().includes("venci")
      );
      // .filter((r) => r.TipoOperacion !== "Otro" && r.TipoOperacion !== "Excluida");
    }

    if (type === "vencido_sin_ventas") {
      setReportTitle("Productos sin ventas y dados de baja por vencimiento");

      const gruposFiltrados = Object.values(grouped).filter(
        (group) =>
          !group.some((r) => isVenta(r.Operacion)) &&
          group.some((r) => r.Operacion?.toLowerCase().includes("vencido"))
      );

      result = gruposFiltrados.flat(); // Unimos todos los grupos en un solo array
    }

    if (result.length) {
      const cols = Object.keys(result[0]).map((field) => ({
        field,
        headerName: field,
        flex: 1,
        sortable: true,
      }));
      setColumns(cols);
      setFilteredRows(result);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analizador de movimientos de stock
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <Button variant="contained" component="label">
            Subir archivo Excel
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".xls,.xlsx"
            />
          </Button>
          {fileName && <Typography variant="body2">{fileName}</Typography>}
        </Stack>

        {originalRows.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
          >
            <DatePicker
              label="Desde"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DatePicker
              label="Hasta"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <Button variant="outlined" onClick={applyDateFilter}>
              Aplicar filtro de fechas
            </Button>
          </Stack>
        )}

        {originalRows.length > 0 && (
          <Stack spacing={1} direction="row" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => runReport("no_ventas")}>
              Sin ventas
            </Button>
            <Button variant="outlined" onClick={() => runReport("vencidos")}>
              Bajas por vencimiento
            </Button>
            {/* <Button
              variant="outlined"
              onClick={() => runReport("vencidos_mas_que_ventas")}
            >
              Más vencidas que vendidas
            </Button> */}
            <Button
              variant="outlined"
              onClick={() => runReport("vencido_sin_ventas")}
            >
              Vencido sin ventas
            </Button>
          </Stack>
        )}

        {reportTitle && (
          <Typography variant="h6" gutterBottom>
            {reportTitle}
          </Typography>
        )}

        {filteredRows.length > 0 && columns.length > 0 && (
          <Paper elevation={3} sx={{ height: 600 }}>
            <DataGrid
              rows={filteredRows.map((r, i) => ({ id: i, ...r }))}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
            />
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}

// components/MovementAnalyzer.jsx
