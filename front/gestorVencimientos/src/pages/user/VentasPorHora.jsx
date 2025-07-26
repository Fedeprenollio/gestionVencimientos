// VentasPorHora.jsx
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GraficoVentasPorHora from "./GraficoVentasPorHora";

export function VentasPorHora({ ventas, fechaDesde, fechaHasta }) {
  console.log("ventas", ventas);
  const resumen = {};

  ventas.forEach((venta) => {
    if (
      !venta.fechaVenta?.isValid?.() ||
      !venta.horaVenta ||
      (fechaDesde && venta.fechaVenta.isBefore(fechaDesde.startOf("day"))) ||
      (fechaHasta && venta.fechaVenta.isAfter(fechaHasta.endOf("day")))
    )
      return;

    const hora = venta.horaVenta;
    if (typeof hora !== "number" || isNaN(hora)) return;

    const franja = `${hora}:00 - ${hora + 1}:00`;

    if (!resumen[franja]) {
      resumen[franja] = { total: 0, cantidad: 0 };
    }

    resumen[franja].total += venta.total;
    resumen[franja].cantidad += venta.cantidad;
  });

  const franjasOrdenadas = Object.entries(resumen).sort(
    ([a], [b]) => parseInt(a.split(":")[0]) - parseInt(b.split(":")[0])
  );
  const data = franjasOrdenadas.map(([franja, valores]) => ({
    franja,
    cantidad: valores.cantidad ?? 0,
    total: valores.total ?? 0,
  }));

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ventas por Franja Horaria
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Franja Horaria</TableCell>
            <TableCell align="right">Unidades</TableCell>
            <TableCell align="right">Total $</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {franjasOrdenadas.map(([franja, datos]) => (
            <TableRow key={franja}>
              <TableCell>{franja}</TableCell>
              <TableCell align="right">{datos.cantidad}</TableCell>
              <TableCell align="right">${datos.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <GraficoVentasPorHora data={data} />
    </Paper>
  );
}
