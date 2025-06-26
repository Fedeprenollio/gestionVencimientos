// components/shared/FullPageLoader.jsx
import { Box, CircularProgress, Typography } from "@mui/material";

export default function FullPageLoader() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(27, 23, 23, 0.6)",
        zIndex: 1300, // encima de todo
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" value={75} size={80} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
           Cargando...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
