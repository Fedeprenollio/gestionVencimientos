import { Box, Typography } from "@mui/material";
import StockImportHistory from "../../components/uploadStockExcel/StockImportHistory";
import SucursalSelector from "../../components/SucursalSelector";


export default function HistorialStock() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Historial de Importaciones de Stock
      </Typography>
      <SucursalSelector />
      <Box mt={3}>
        <StockImportHistory />
      </Box>
    </Box>
  );
}
