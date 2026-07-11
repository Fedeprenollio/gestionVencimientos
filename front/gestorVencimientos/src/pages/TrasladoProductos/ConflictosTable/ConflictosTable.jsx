import React from "react";
import { Box, Alert, Paper, Typography, Button } from "@mui/material";

import { exportToExcel } from "../../AsiganacionesDeStocks/excelService";
import ConflictCard from "./ConflictCard";

export default function ConflictosTable({
  conflicts,
  groupedBySucursal,
  groupedByOrigen,
  guardarConflicto,
}) {
  const conflictosPendientes =
    conflicts?.filter((c) =>
      c.movimientos.some((m) => m.cantidadTrasladar > 0),
    ) ?? [];

  console.log("conflicts", conflicts);
  return (
    <Box mt={3}>
      <Alert
        severity={conflictosPendientes.length === 0 ? "success" : "warning"}
        sx={{ mb: 3 }}
      >
        {conflictosPendientes.length === 0
          ? "Todos los conflictos fueron revisados."
          : `Hay ${conflictosPendientes.length} conflictos por revisar.`}
      </Alert>

      {conflicts.map((conflict) => {
        switch (conflict.tipo) {
          case "duplicado":
            return (
              <ConflictCard
                key={conflict.key}
                conflict={conflict}
                guardarConflicto={guardarConflicto}
              />
            );

          case "ventas": {
            const movimiento = conflict.movimientos[0];

            return (
              <Paper key={conflict.key} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6">{conflict.producto}</Typography>

                <Typography color="text.secondary">
                  Código: {conflict.codigo}
                </Typography>

                <Typography color="text.secondary">
                  Origen: <b>{movimiento.sucursalOrigen}</b>
                </Typography>

                <Typography color="text.secondary">
                  Destino: <b>{conflict.destino}</b>
                </Typography>

                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  La sucursal origen vende <b>{movimiento.ventasOrigen}</b>{" "}
                  unidades y el destino vende solamente{" "}
                  <b>{movimiento.ventasDestino}</b>.
                  <br />
                  Quizás no convenga realizar este traslado.
                </Alert>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      guardarConflicto(conflict, {
                        [movimiento.id]: 0,
                      })
                    }
                  >
                    No trasladar
                  </Button>

                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                      guardarConflicto(conflict, {
                        [movimiento.id]: movimiento.cantidadTrasladar,
                      })
                    }
                  >
                    Mantener traslado
                  </Button>
                </Box>
              </Paper>
            );
          }

        case "rotacion": {
  const movimiento = conflict.movimientos[0];

  return (
    <Paper key={conflict.key} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6">
        {conflict.producto}
      </Typography>

      <Typography color="text.secondary">
        Código: {conflict.codigo}
      </Typography>

     <Typography color="text.secondary">
  Origen: <b>{movimiento.sucursalOrigen}</b>
  {"  "}
  (<b>{movimiento.ventasOrigen}</b> ventas/año)
</Typography>

<Typography color="text.secondary">
  Destino sugerido: <b>{movimiento.sucursalDestino}</b>
  {"  "}
  (<b>{movimiento.ventasDestino}</b> ventas/año)
</Typography>

      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        El producto vence en <b>{movimiento.vence}</b>.
        <br />
        Se estima que <b>{movimiento.sucursalOrigen}</b> venderá aproximadamente{" "}
        <b>{conflict.ventasEsperadas.toFixed(1)}</b> unidades antes del
        vencimiento (quedan <b>{conflict.mesesRestantes}</b> meses).
        <br />
        El traslado sugerido es hacia <b>{movimiento.sucursalDestino}</b>, que
        vende <b>{movimiento.ventasDestino}</b> unidades por año.
        <br />
        ¿Desea mantener el producto en la sucursal de origen o realizar igualmente
        el traslado?
      </Alert>

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            guardarConflicto(conflict, {
              [movimiento.id]: 0,
            })
          }
        >
          Mantener en origen
        </Button>

        <Button
          variant="outlined"
          color="warning"
          onClick={() =>
            guardarConflicto(conflict, {
              [movimiento.id]: movimiento.cantidadTrasladar,
            })
          }
        >
          Trasladar igualmente
        </Button>
      </Box>
    </Paper>
  );
}
          default:
            return null;
        }
      })}

      <Paper
        sx={{
          mt: 4,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Exportación
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Cuando termine de revisar los conflictos puede generar los dos
          archivos.
        </Typography>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => exportToExcel(groupedBySucursal, true)}
          >
            Exportar Distribución
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => exportToExcel(groupedByOrigen, false)}
          >
            Exportar Pedidos
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
