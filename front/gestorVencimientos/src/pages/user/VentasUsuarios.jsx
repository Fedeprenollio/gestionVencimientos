import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
  TableSortLabel,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { VentasCadaUsuario } from "./VentasCadaUsuario";
import { VentasPorHora } from "./VentasPorHora";

export default function VentasUsuarios() {
  const [ventas, setVentas] = useState([]);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  const [orderBy, setOrderBy] = useState("operador");
  const [orderDirection, setOrderDirection] = useState("asc");

  const [horasPorDia, setHorasPorDia] = useState({}); // horas diarias personalizadas
  const [diasPorUsuario, setDiasPorUsuario] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { raw: false });

      const ventasFiltradas = data.filter((row) => {
        const operacion = row["Operacion"] || row["operación"] || "";
        return operacion.toLowerCase().includes("facturacion fv");
      });

      const parsedData = ventasFiltradas.map((row) => {
        let fechaVenta = null;
        const fechaCruda = row["Fecha"];

        if (typeof fechaCruda === "number") {
          const utc_days = Math.floor(fechaCruda - 25569);
          const utc_value = utc_days * 86400 * 1000;
          fechaVenta = dayjs(new Date(utc_value));
        } else if (typeof fechaCruda === "string") {
          const [d, m, y] = fechaCruda.split(/[\/\-]/).map(Number);
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            fechaVenta = dayjs(new Date(y, m - 1, d));
          } else {
            const fallback = new Date(fechaCruda);
            if (!isNaN(fallback.getTime())) {
              fechaVenta = dayjs(fallback);
            }
          }
        }

        const horaStr = row["Hora"];
        let horaVenta = null;
        if (typeof horaStr === "string") {
          const [h, m, s] = horaStr.split(":").map(Number);
          if (!isNaN(h)) {
            horaVenta = h;
          }
        }

        return {
          operador: row["Operador"] || "Desconocido",
          producto: row["Producto"] || "Producto desconocido",
          cantidad: Math.abs(Number(row["Cantidad"])) || 0,
          total: Math.abs(Number(row["Total"])) || 0,
          fechaVenta,
          horaVenta,
        };
      });

      setVentas(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  // Agrupa y cuenta días con ventas
  React.useEffect(() => {
    const agrupadas = {};
    const diasUnicos = {};

    ventas.forEach((venta) => {
      if (!venta.fechaVenta || !venta.fechaVenta.isValid?.()) return;

      if (
        fechaDesde &&
        venta.fechaVenta.isBefore(dayjs(fechaDesde).startOf("day"))
      )
        return;
      if (
        fechaHasta &&
        venta.fechaVenta.isAfter(dayjs(fechaHasta).endOf("day"))
      )
        return;

      const operador = venta.operador;
      const fechaStr = venta.fechaVenta.format("YYYY-MM-DD");

      if (!agrupadas[operador]) {
        agrupadas[operador] = { cantidad: 0, total: 0 };
        diasUnicos[operador] = new Set();
      }

      agrupadas[operador].cantidad += venta.cantidad;
      agrupadas[operador].total += venta.total;
      diasUnicos[operador].add(fechaStr);
    });

    const diasPorOp = {};
    Object.entries(diasUnicos).forEach(([op, setFechas]) => {
      diasPorOp[op] = setFechas.size;
    });

    setDiasPorUsuario(diasPorOp);
  }, [ventas, fechaDesde, fechaHasta]);

  // Agrupación de ventas para tabla
  const ventasAgrupadas = React.useMemo(() => {
    const agrupadas = {};

    ventas.forEach((venta) => {
      if (!venta.fechaVenta || !venta.fechaVenta.isValid?.()) return;

      if (
        fechaDesde &&
        venta.fechaVenta.isBefore(dayjs(fechaDesde).startOf("day"))
      )
        return;
      if (
        fechaHasta &&
        venta.fechaVenta.isAfter(dayjs(fechaHasta).endOf("day"))
      )
        return;

      const operador = venta.operador;

      if (!agrupadas[operador]) {
        agrupadas[operador] = { cantidad: 0, total: 0 };
      }

      agrupadas[operador].cantidad += venta.cantidad;
      agrupadas[operador].total += venta.total;
    });

    return agrupadas;
  }, [ventas, fechaDesde, fechaHasta]);

  const filas = Object.entries(ventasAgrupadas).map(([operador, datos]) => ({
    operador,
    cantidad: datos.cantidad,
    total: datos.total,
  }));

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filasOrdenadas = filas.sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return orderDirection === "asc" ? -1 : 1;
    if (valA > valB) return orderDirection === "asc" ? 1 : -1;
    return 0;
  });

  const calcularValorHora = (operador, total) => {
    // Promedio simple para quien trabaja 8hs lun-vie y 4hs sabado: 44hs / 6 días = 7.33 hs/día
    const horasDia = horasPorDia[operador] ?? 7.33;
    const dias = diasPorUsuario[operador] || 1;
    const horasTotales = horasDia * dias;
    return horasTotales > 0 ? (total / horasTotales).toFixed(2) : "-";
  };

  const handleHorasChange = (operador, value) => {
    setHorasPorDia((prev) => ({
      ...prev,
      [operador]: Number(value),
    }));
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Ventas por Usuario
      </Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <DatePicker
          label="Fecha desde"
          value={fechaDesde}
          onChange={(newValue) => setFechaDesde(newValue)}
          format="DD/MM/YYYY"
          slotProps={{ textField: { variant: "outlined", size: "small" } }}
        />
        <DatePicker
          label="Fecha hasta"
          value={fechaHasta}
          onChange={(newValue) => setFechaHasta(newValue)}
          format="DD/MM/YYYY"
          slotProps={{ textField: { variant: "outlined", size: "small" } }}
        />
      </Stack>

      {filasOrdenadas.length > 0 ? (
        <VentasCadaUsuario
          orderDirection={orderDirection}
          orderBy={orderBy}
          handleSortRequest={handleSortRequest}
          filasOrdenadas={filasOrdenadas}
          horasPorDia={horasPorDia}
          handleHorasChange={handleHorasChange}
          diasPorUsuario={diasPorUsuario}
          calcularValorHora={calcularValorHora}
        />
      ) : (
        <Typography variant="body1">No hay datos para mostrar.</Typography>
      )}

      {ventas && (
        <VentasPorHora
          ventas={ventas}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
        />
      )}
    </Box>
  );
}
