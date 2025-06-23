import React from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { exportToExcelLots, formatDate } from "../../../utils/exportUtils";

export default function CreatedLotsTable({ createdLots, onClear }) {
  if (!createdLots || createdLots.length === 0) return null;

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Lotes cargados hoy
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Vencimiento</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Sucursal</TableCell>
            <TableCell>SobreStock</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {createdLots.map((lot, idx) => (
            <TableRow key={idx}>
              <TableCell>{lot.name}</TableCell>
              <TableCell>{lot.barcode}</TableCell>
              <TableCell>{formatDate(lot.expirationDate)}</TableCell>
              <TableCell>{lot.quantity}</TableCell>
              <TableCell>{lot.branch}</TableCell>
              <TableCell>
                {lot.overstock ? (
                  <Chip label="Sí" color="warning" size="small" />
                ) : (
                  <Chip label="No" variant="outlined" size="small" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="outlined"
          onClick={() => exportToExcelLots(createdLots)}
        >
          Exportar a Excel
        </Button>
        <Button variant="outlined" color="error" onClick={onClear}>
          Limpiar jornada
        </Button>
      </Box>
    </Box>
  );
}
