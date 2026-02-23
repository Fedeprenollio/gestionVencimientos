import { Box, Typography, Chip, Stack } from "@mui/material";

const riesgoColor = {
  bajo: "success",
  medio: "warning",
  alto: "error",
};

export default function HeaderFarmaco({ farmaco }) {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        {farmaco.nombre}
      </Typography>

      {/* PRINCIPIOS ACTIVOS */}
      {farmaco.principiosActivos && (
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Principios activos:
          </Typography>

          {farmaco.principiosActivos.map((pa, index) => (
            <Typography key={index} variant="body2">
              • {pa.nombre} → {pa.funcionSimple}
            </Typography>
          ))}
        </Box>
      )}
      {/* Debajo del nombre del fármaco */}
      <Box
        sx={{
          my: 2,
          p: 2,
          bgcolor: "#f0f4f8",
          borderRadius: 2,
          borderLeft: "5px solid #1976d2",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          ¿POR QUÉ ELEGIR ESTE MEDICAMENTO?
        </Typography>
        {/* <Typography
          style={{ whiteSpace: "pre-line" }}
          variant="body1"
          sx={{ mt: 1, fontStyle: "italic" }}
        >
          {farmaco.perfilDestacado}
        </Typography> */}
        <Stack spacing={2} sx={{ my: 3 }}>
          {/* Caja de PROS (Perfil Destacado) */}
          <Box
          
            sx={{
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              borderLeft: "5px solid #1976d2",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: "#1565c0" }}
            >
              ✅ ARGUMENTO A FAVOR
            </Typography>
            <Typography style={{ whiteSpace: "pre-line" }} variant="body2" sx={{ mt: 1 }}>
              {farmaco.perfilDestacado}
            </Typography>
          </Box>

          {/* Caja de CONTRAS (Limitación Clave) */}
          {farmaco.limitacionClave && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#fff3e0",
                borderRadius: 2,
                borderLeft: "5px solid #f57c00",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: "#e65100" }}
              >
                ⚠️ LIMITACIÓN / A TENER EN CUENTA
              </Typography>
              <Typography style={{ whiteSpace: "pre-line" }} variant="body2" sx={{ mt: 1 }}>
                {farmaco.limitacionClave}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* DIFERENCIA CLAVE */}
      {farmaco.diferenciaClave && (
        <Box mt={2}>
          <Typography variant="body2" fontWeight="bold" color="primary">
            🔎 Diferencia clave:
          </Typography>
          <Typography variant="body2">{farmaco.diferenciaClave}</Typography>
        </Box>
      )}

      <Box mt={2}>
        <Chip label={farmaco.grupo} sx={{ mr: 1 }} />
        <Chip
          label={`Riesgo ${farmaco.nivelRiesgo}`}
          color={riesgoColor[farmaco.nivelRiesgo]}
        />
      </Box>
    </Box>
  );
}
