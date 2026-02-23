import { Box, Typography, Button, Stack, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Opcional si usas iconos
import { farmacosData } from "../../data/farmacos";

export default function SeccionEquivalentes({ farmacoActual }) {
  const navigate = useNavigate();

  // Si el fármaco no tiene grupo, no mostramos nada
  if (!farmacoActual.grupoEquivalencia) return null;

  // Buscamos todos los que pertenecen al mismo grupo pero tienen ID distinto
  const alternativas = farmacosData.filter(
    (f) => f.grupoEquivalencia === farmacoActual.grupoEquivalencia && f.id !== farmacoActual.id
  );

  if (alternativas.length === 0) return null;

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareArrowsIcon color="primary" /> 
        Alternativas con igual composición:
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
        {alternativas.map((alt) => (
          <Button
            key={alt.id}
            variant="outlined"
            size="small"
            onClick={() => navigate(`/farmacos/${alt.id}`, { state: { tipoPaciente: 'adulto' } })}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' }
            }}
          >
            {alt.nombre}
          </Button>
        ))}
      </Stack>
      
      <Alert severity="warning" variant="outlined" sx={{ mt: 2, fontSize: '0.75rem', py: 0 }}>
        Confirmar siempre miligramos exactos de Ergotamina/Analgeticos antes de sustituir.
      </Alert>
    </Box>
  );
}