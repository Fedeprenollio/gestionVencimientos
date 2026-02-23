import { Alert, Box } from "@mui/material";

export default function SeccionAlertas({ farmaco }) {
  return (
    <Box>

      {farmaco.noDarSi?.length > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          <strong>No dar si:</strong> {farmaco.noDarSi.join(", ")}
        </Alert>
      )}

      {farmaco.precauciones?.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          <strong>Precaución:</strong> {farmaco.precauciones.join(", ")}
        </Alert>
      )}

      {farmaco.derivarSi?.length > 0 && (
        <Alert severity="error">
          <strong>Derivar si:</strong> {farmaco.derivarSi.join(", ")}
        </Alert>
      )}

    </Box>
  );
}