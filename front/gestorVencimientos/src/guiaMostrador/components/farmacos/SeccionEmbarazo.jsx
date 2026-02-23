import { Box, Chip, Typography } from "@mui/material";

const colorMap = {
  verde: "success",
  amarillo: "warning",
  rojo: "error"
};

export default function SeccionEmbarazo({ farmaco }) {
  return (
    <Box>
      <Typography variant="h6">Embarazo y Lactancia</Typography>

      <Box mt={1}>
        <Chip
          label={`Embarazo: ${farmaco.embarazo?.texto}`}
          color={colorMap[farmaco.embarazo?.estado]}
          sx={{ mr: 1 }}
        />
        <Chip
          label={`Lactancia: ${farmaco.lactancia?.texto}`}
          color={colorMap[farmaco.lactancia?.estado]}
        />
      </Box>
    </Box>
  );
}