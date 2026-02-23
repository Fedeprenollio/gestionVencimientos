import { Paper, Typography, Box, Divider } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { gruposInfo } from "../../data/gruposInfo";

export default function SeccionEducacionGrupo({ claseId }) {
  const info = gruposInfo[claseId];
  if (!info) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8fbff', border: '1px solid #d0e3ff', borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: '#1565c0' }}>
        <InfoIcon /> {info.titulo}
      </Typography>
      
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
        "{info.explicacion}"
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>✓ VENTAJAS</Typography>
          <Typography variant="caption" display="block">{info.pros}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>✗ DESVENTAJAS</Typography>
          <Typography variant="caption" display="block">{info.contras}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        💡 Tip para el cliente: <span style={{ fontWeight: 'normal' }}>{info.tipPublico}</span>
      </Typography>
    </Paper>
  );
}