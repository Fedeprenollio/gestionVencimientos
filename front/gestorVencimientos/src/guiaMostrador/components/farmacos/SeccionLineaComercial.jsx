import { Box, Typography, Chip, Stack, Divider } from "@mui/material";

export default function SeccionLineaComercial({ farmaco }) {
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>Composición y Variantes</Typography>
      
      {/* Principios Activos */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {farmaco.principiosActivos.map((pa, idx) => (
          <Chip 
            key={idx} 
            label={typeof pa === 'string' ? pa : pa.nombre} 
            variant="outlined" 
            color="primary" 
            size="small"
          />
        ))}
      </Stack>

      {/* Si es una familia como Migral */}
      {farmaco.versionesComerciales && (
        <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid #eee' }}>
          <Typography variant="subtitle2" color="text.secondary">Otras presentaciones de la línea:</Typography>
          {farmaco.versionesComerciales.map((v, idx) => (
            <Box key={idx} sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>{v.nombre}</strong>: {v.diferenciaClave}</Typography>
              <Typography variant="caption" color="text.secondary">
                Componentes: {v.principiosActivos?.map(p => p).join(" + ")}
              </Typography>
              {idx < farmaco.versionesComerciales.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}