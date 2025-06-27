// components/lots/LotList.jsx
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import ExpiringProductList from "../products/ExpiringProductList";

const LotList = () => {
  return (
    <Box
      sx={{
        px: 2, // padding horizontal (ajustado)
        py: 4, // padding vertical
        width: "100%", // que no se pase del ancho
        overflowX: "hidden", // evita scroll horizontal
        boxSizing: "border-box", // incluye el padding en el ancho total
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.25rem" }, // texto más pequeño en móviles
        }}
      >
        Productos próximos a vencer
      </Typography>

      <ExpiringProductList />
    </Box>
  );
};

export default LotList;
