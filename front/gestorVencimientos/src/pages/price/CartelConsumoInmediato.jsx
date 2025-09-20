import { Button, Box } from "@mui/material";
import { generatePDF_CartelMixto } from "../../../utils/etiquetas/generatePDF";

export default function CartelConsumoInmediato() {
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Button
        variant="contained"
        color="error"
        size="large"
        onClick={() => generatePDF_CartelMixto()}
      >
        Generar cartel de Consumo Inmediato
      </Button>
    </Box>
  );
}
