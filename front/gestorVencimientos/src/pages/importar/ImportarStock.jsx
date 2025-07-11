import { Box, Typography } from "@mui/material";
import SucursalSelector from "../../components/SucursalSelector";


export default function ImportarStock() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Importar Stock por Sucursal
      </Typography>
      <SucursalSelector />
      <Box mt={3}>
        <UploadStockExcel />
      </Box>
    </Box>
  );
}
