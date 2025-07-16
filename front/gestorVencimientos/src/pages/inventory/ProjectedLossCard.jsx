// ProjectedLossCard.jsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import TopProjectedLosses from "./TopProjectedLosses";

export default function ProjectedLossCard({ data }) {
  // Filtramos productos con DSI alto

  const productosCriticos = data.filter(
    (item) =>
      (item.dsi === Infinity || item.dsi > 180) &&
      item.stock > 0 &&
      item.costo > 0 // Asegurarse de tener el costo
  );
console.log("productosCriticos",productosCriticos)
  // Calculamos las pérdidas
  const perdidaEstimacion = productosCriticos.reduce((acc, item) => {
    return acc + item.stock * item.costo;
  }, 0);

  return (
    <Box mt={4}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pérdidas proyectadas por vencimiento
        </Typography>
        <Typography variant="h4" color="error">
          Estimación: ${perdidaEstimacion.toFixed(2)}
        </Typography>
        <Typography variant="caption">
          Basado en el stock actual y el costo de los productos con DSI muy alto.
        </Typography>
      </Paper>
      <TopProjectedLosses dsiData={data }/>
    </Box>
  );
}
