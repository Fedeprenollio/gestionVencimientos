import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Chip,
  Alert,
  Stack,
} from "@mui/material";

export default function ConflictCard({ conflict, guardarConflicto }) {
  const [cantidades, setCantidades] = useState({});

  // Inicializa las cantidades al cargar la tarjeta
  useEffect(() => {
    const inicial = {};

    conflict.movimientos.forEach((m) => {
      inicial[m.id] = m.cantidadTrasladar;
    });

    setCantidades(inicial);
  }, [conflict]);

  // Total que necesita recibir el destino
  const totalNecesario = conflict.cantidadNecesaria;

  // Total asignado por el usuario
  const totalAsignado = useMemo(() => {
    return Object.values(cantidades).reduce(
      (suma, n) => suma + (Number(n) || 0),
      0,
    );
  }, [cantidades]);

  const handleCantidad = (id, value) => {
    let cantidad = Number(value);

    if (isNaN(cantidad)) cantidad = 0;

    const movimiento = conflict.movimientos.find((m) => m.id === id);

    cantidad = Math.max(0, Math.min(cantidad, movimiento.cantidadOriginal));

    setCantidades((prev) => ({
      ...prev,
      [id]: cantidad,
    }));
  };

  const restaurar = () => {
    const inicial = {};

    conflict.movimientos.forEach((m) => {
      inicial[m.id] = m.cantidadTrasladar;
    });

    setCantidades(inicial);
  };
  console.log(conflict.movimientos);
  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        border: "2px solid orange",
      }}
    >
      <Typography variant="h6">{conflict.producto}</Typography>

      <Typography color="text.secondary">Código: {conflict.codigo}</Typography>

      <Typography color="text.secondary">
        Destino: {conflict.destino}
      </Typography>

      <Chip
        sx={{ mt: 2, mb: 3 }}
        color="warning"
        label={`${conflict.movimientos.length} sucursales disponibles`}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Origen</TableCell>

            <TableCell align="center">Disponible</TableCell>

            <TableCell align="center">Ventas origen</TableCell>

            <TableCell align="center">Ventas destino</TableCell>

            <TableCell align="center">Vence</TableCell>

            <TableCell align="center">Enviar</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {conflict.movimientos.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.sucursalOrigen}</TableCell>

              <TableCell align="center">{m.cantidadOriginal}</TableCell>

              <TableCell align="center">{m.ventasOrigen}</TableCell>

              <TableCell
                align="center"
                sx={{
                  color:
                    m.ventasDestino < m.ventasOrigen
                      ? "error.main"
                      : "success.main",
                  fontWeight: "bold",
                }}
              >
                {m.ventasDestino}
              </TableCell>

              <TableCell align="center">{m.vence}</TableCell>

              <TableCell align="center">
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <TextField
                    type="number"
                    size="small"
                    sx={{ width: 70 }}
                    inputProps={{
                      min: 0,
                      max: m.cantidadOriginal,
                    }}
                    value={cantidades[m.id] ?? 0}
                    onChange={(e) => handleCantidad(m.id, e.target.value)}
                  />

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleCantidad(m.id, 0)}
                  >
                    0
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCantidad(m.id, m.cantidadOriginal)}
                  >
                    MAX
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box mt={3}>
        <Typography variant="subtitle1">
          Total requerido:
          <b> {totalNecesario}</b>
        </Typography>

        <Typography variant="subtitle1">
          Total asignado:
          <b> {totalAsignado}</b>
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
  <Typography fontWeight="bold">
    Propuesta automática: {conflict.cantidadNecesaria}
  </Typography>

  <Typography>
    Asignadas manualmente: {totalAsignado}
  </Typography>

  {conflict.movimientos.some(
    (m) => m.ventasOrigen > m.ventasDestino
  ) && (
    <Typography
      sx={{
        mt: 1,
        color: "error.main",
      }}
    >
      ⚠ Algunas sucursales venden más que el destino.
      Revise si realmente conviene trasladar el producto.
    </Typography>
  )}
</Alert>

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => guardarConflicto(conflict, cantidades)}
        >
          Guardar cambios
        </Button>

        <Button variant="outlined" onClick={restaurar}>
          Restaurar propuesta
        </Button>
      </Box>
    </Paper>
  );
}
