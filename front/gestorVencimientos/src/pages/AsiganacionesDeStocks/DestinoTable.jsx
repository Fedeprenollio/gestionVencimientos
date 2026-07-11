// components/DestinoTable.jsx

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

export default function DestinoTable({ groupedBySucursal, exportToExcel }) {
  return (
    <>
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => exportToExcel(groupedBySucursal, true)}
      >
        Exportar Excel (Distribución)
      </Button>

      {Object.keys(groupedBySucursal).map((suc) => (
        <Paper key={suc} sx={{ my: 3, p: 2 }}>
          <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sucursal Origen</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Vence</TableCell>
                <TableCell>PVP</TableCell>
                <TableCell>Cantidad a trasladar</TableCell>
                <TableCell>Ventas en origen</TableCell>
                <TableCell>Ventas en destino</TableCell>
                <TableCell>Stock en destino</TableCell>
                <TableCell>Nota</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedBySucursal[suc]
                .filter((item) => item.activo)
                .map((item) => (
                  <TableRow
                    key={`${item.codigo}-${item.sucursalOrigen}-${item.sucursalDestino}`}
                  >
                    <TableCell>{item.sucursalOrigen}</TableCell>
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
                    <TableCell>{item.stockDestino}</TableCell>
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
