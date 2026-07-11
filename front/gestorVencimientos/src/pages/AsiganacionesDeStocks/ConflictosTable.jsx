import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Chip,
  Alert,
  Divider,
} from "@mui/material";

import { exportToExcel } from "./excelService";

export default function ConflictosTable({
  conflicts,
  resolverConflicto,
  groupedBySucursal,
  groupedByOrigen,
}) {
  const [seleccionados, setSeleccionados] = useState({});

  return (
    <Box mt={3}>
      <Alert
        severity={conflicts.length === 0 ? "success" : "warning"}
        sx={{ mb: 3 }}
      >
        {conflicts.length === 0
          ? "Todos los conflictos fueron resueltos. Ya puede exportar los Excel."
          : `Hay ${conflicts.length} conflictos por resolver antes de exportar.`}
      </Alert>

      {conflicts.map((conflict) => (
        <Paper
          key={conflict.key}
          sx={{
            p: 3,
            mb: 3,
            border: "2px solid orange",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">
            {conflict.producto}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Código: <b>{conflict.codigo}</b>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Destino: <b>{conflict.destino}</b>
          </Typography>

          <Chip
            sx={{ mt: 2, mb: 2 }}
            color="warning"
            label={`${conflict.movimientos.length} sucursales envían este producto`}
          />

          <Divider sx={{ mb: 2 }} />

          <RadioGroup
            value={seleccionados[conflict.key] || ""}
            onChange={(e) =>
              setSeleccionados((prev) => ({
                ...prev,
                [conflict.key]: e.target.value,
              }))
            }
          >
            {conflict.movimientos.map((m) => (
              <Paper
                key={m.id}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                }}
              >
                <FormControlLabel
                  value={m.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography fontWeight="bold">
                        {m.sucursalOrigen}
                      </Typography>

                      <Typography variant="body2">
                        Cantidad: {m.cantidadTrasladar}
                      </Typography>

                      <Typography variant="body2">
                        Ventas origen: {m.ventasOrigen}
                      </Typography>

                      <Typography variant="body2">
                        Ventas destino: {m.ventasDestino}
                      </Typography>

                      <Typography variant="body2">
                        Vence: {m.vence}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            ))}
          </RadioGroup>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              disabled={!seleccionados[conflict.key]}
              onClick={() =>
                resolverConflicto(
                  conflict,
                  seleccionados[conflict.key]
                )
              }
            >
              Resolver conflicto
            </Button>
          </Box>
        </Paper>
      ))}

      {/* {conflicts.length === 0 && ( */}
      {true && ( 
        <Paper
          sx={{
            mt: 4,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            ✔ Todos los conflictos fueron resueltos
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Ya puede generar los archivos para enviar a las sucursales.
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            gap={2}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                exportToExcel(groupedBySucursal, true)
              }
            >
              Exportar Distribución
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                exportToExcel(groupedByOrigen, false)
              }
            >
              Exportar Pedidos
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}