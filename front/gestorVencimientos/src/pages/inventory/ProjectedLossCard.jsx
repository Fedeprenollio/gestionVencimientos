// ProjectedLossCard.jsx
import React from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import TopProjectedLosses from "./TopProjectedLosses";
import { exportProjectedLossesToExcel } from "./exportProjectedLossesToExcel";
import useInventoryStore from "../../store/useInventoryStore";

export default function ProjectedLossCard() {
  const { dsiData: data, stockNormalizado, unidadesPerdidas } = useInventoryStore();
  // Filtramos productos con DSI alto
console.log("DATA PARA PERDIDAS PROYECTADAS", data)

 const productosCriticos = data
    .filter((item) => item.dsi >= 365 && item.stock > 0 && item.costo > 0)
    .map((item) => {
      const unidadesPerdidas = Math.max(0, item.stock - item.ventasAnuales);
      const perdidaProyectada = unidadesPerdidas * item.costo;
      return { ...item, unidadesPerdidas, perdidaProyectada };
    });
  console.log("productosCriticos", productosCriticos);


  // Calculamos las pérdidas
const perdidaEstimacion = productosCriticos.reduce((acc, item) => {
  return acc + item.unidadesPerdidas * item.costo;
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
          Basado en el stock actual y el costo de los productos con DSI muy
          alto. Se estiman peridas a las unidades no vendidas del stock actual que no se venden dentro del año.
        </Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 2 }}
          onClick={() => exportProjectedLossesToExcel(productosCriticos)}
          disabled={productosCriticos.length === 0}
        >
          Exportar a Excel
        </Button>
      </Paper>
      <TopProjectedLosses dsiData={productosCriticos} />
    </Box>
  );
}
