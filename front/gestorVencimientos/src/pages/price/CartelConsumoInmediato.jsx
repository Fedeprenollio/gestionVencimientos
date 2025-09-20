import { Button, Box, Stack, Typography } from "@mui/material";
import {
  generatePDF_Cartel20,
  generatePDF_Cartel20B,
  generatePDF_Cartel30,
  generatePDF_Cartel30B,
  generatePDF_CartelMixto,
  generatePDF_CartelMixtoB,
} from "../../../utils/etiquetas/generatePDF";

export default function CartelConsumoInmediato() {
  return (
   <>
    <Box sx={{ textAlign: "center", mt: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Generar Cartelería
      </Typography>

      <Stack spacing={3} alignItems="center">
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ width: 300, fontSize: "1.1rem" }}
          onClick={() => generatePDF_CartelMixto()}
        >
          🟥 Consumo Inmediato (40% / 60%)
        </Button>

        <Button
          variant="contained"
          sx={{
            width: 300,
            fontSize: "1.1rem",
            backgroundColor: "#d32f2f",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
          onClick={() => generatePDF_Cartel30()}
        >
          🔴 Cartel -30%
        </Button>

        <Button
          variant="contained"
          sx={{
            width: 300,
            fontSize: "1.1rem",
            backgroundColor: "#ff9800",
            "&:hover": { backgroundColor: "#ef6c00" },
          }}
          onClick={() => generatePDF_Cartel20()}
        >
          🟠 Cartel -20%
        </Button>
      </Stack>
    </Box>
    <Box sx={{ textAlign: "center", mt: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Generar Cartelería
      </Typography>

      <Stack spacing={3} alignItems="center">
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ width: 300, fontSize: "1.1rem" }}
          onClick={() => generatePDF_CartelMixtoB()}
        >
          🟥 Consumo Inmediato (40% / 60%) Opcion 2
        </Button>

        <Button
          variant="contained"
          sx={{
            width: 300,
            fontSize: "1.1rem",
            backgroundColor: "#d32f2f",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
          onClick={() => generatePDF_Cartel30B()}
        >
          🔴 Cartel -30% Opcion 2
        </Button>

        <Button
          variant="contained"
          sx={{
            width: 300,
            fontSize: "1.1rem",
            backgroundColor: "#ff9800",
            "&:hover": { backgroundColor: "#ef6c00" },
          }}
          onClick={() => generatePDF_Cartel20B()}
        > 
          🟠 Cartel -20% Opcion 2
        </Button>
      </Stack>
    </Box>
   </>
  );
}
