// components/OrigenTable.jsx

import React from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { exportToExcel } from "./excelService";

export default function OrigenTable({ groupedByOrigen }) {
  return (
    <>
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => exportToExcel(groupedByOrigen, false)}
      >
        Exportar Excel (Pedidos)
      </Button>

      {Object.keys(groupedByOrigen).map((origen) => (
        <Paper key={origen} sx={{ my: 3, p: 2 }}>
          <Typography variant="h6">{`Sucursal origen: ${origen}`}</Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Destino (Ventas)</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Vence</TableCell>
                <TableCell>PVP</TableCell>
                <TableCell>Cantidad a trasladar</TableCell>
                <TableCell>Ventas en origen</TableCell>
                <TableCell>Ventas en destino</TableCell>
                <TableCell>Nota</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedByOrigen[origen]
                .filter((item) => item.activo)
                .map((item) => (
                  <TableRow
                    key={`${item.codigo}-${item.sucursalOrigen}-${item.sucursalDestino}`}
                  >
                    <TableCell>
                      {item.sucursalDestino
                        ? `${item.sucursalDestino} (${item.ventasDestino})`
                        : ""}
                    </TableCell>

                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>{item.producto}</TableCell>
                    <TableCell>{item.vence}</TableCell>

                    <TableCell>
                      {item.precioPublico != null
                        ? `$${item.precioPublico}`
                        : ""}
                    </TableCell>

                    <TableCell>{item.cantidadTrasladar}</TableCell>
                    <TableCell>{item.ventasOrigen}</TableCell>
                    <TableCell>{item.ventasDestino}</TableCell>

                    <TableCell style={{ whiteSpace: "pre-line" }}>
                      {item.nota}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </>
  );
}
