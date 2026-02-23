import { Box, Typography, List, ListItem } from "@mui/material";

export default function SeccionPreguntas({ farmaco }) {
  return (
    <Box>
      <Typography variant="h6">Preguntas clave</Typography>

      <List dense>
        {farmaco.preguntasClaveAntesDeVender?.map((pregunta, i) => (
          <ListItem key={i}>• {pregunta}</ListItem>
        ))}
      </List>
    </Box>
  );
}