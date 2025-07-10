import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Paper,
  Chip,
} from "@mui/material";
import { useState } from "react";

export default function TagStatusTable({ productList }) {
    console.log("productList",productList)
  const [fechaReferencia, setFechaReferencia] = useState("");

  const getEstado = (tagDateStr, ultimaModifStr) => {
    const tagDate = tagDateStr ? new Date(tagDateStr) : null;
    const ultimaModif = ultimaModifStr ? new Date(ultimaModifStr) : null;
    const refDate = fechaReferencia ? new Date(fechaReferencia) : null;

    if (!ultimaModif) return <Chip label="Sin precio" color="default" />;
    if (!tagDate) return <Chip label="Sin etiqueta" color="warning" />;

    const fechaComparar = refDate || tagDate;
    return fechaComparar < ultimaModif ? (
      <Chip label="Desactualizada" color="error" />
    ) : (
      <Chip label="Actualizada" color="success" />
    );
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Estado de Etiquetas</Typography>

      <TextField
        type="date"
        label="Comparar con fecha manual"
        InputLabelProps={{ shrink: true }}
        size="small"
        sx={{ mt: 2, mb: 2 }}
        value={fechaReferencia}
        onChange={(e) => setFechaReferencia(e.target.value)}
      />

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Última Etiqueta</TableCell>
              <TableCell>Último Cambio Precio</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productList.products.map((item) => {
              const p = item.product;
              const ultimaModif = p.priceHistory?.[0]?.date;
              return (
                <TableRow key={p._id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.barcode}</TableCell>
                  <TableCell>${p.currentPrice?.toFixed(2)}</TableCell>
                  <TableCell>
                    {item.lastTagDate
                      ? new Date(item.lastTagDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {ultimaModif
                      ? new Date(ultimaModif).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getEstado(item.lastTagDate, ultimaModif)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
