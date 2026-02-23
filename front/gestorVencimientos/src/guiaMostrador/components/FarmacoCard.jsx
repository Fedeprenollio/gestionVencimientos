import { Card, CardContent, Typography, Chip, Stack } from "@mui/material"
import { useNavigate } from "react-router-dom"

export default function FarmacoCard({ farmaco }) {
  const navigate = useNavigate()

  const colorRiesgo = {
    bajo: "success",
    medio: "warning",
    alto: "error"
  }

  return (
    <Card
      sx={{ cursor: "pointer" }}
      onClick={() => navigate(`/farmacos/${farmaco.id}`)}
    >
      <CardContent>
        <Typography variant="h6">{farmaco.nombre}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {farmaco.grupo}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label={farmaco.requiereReceta ? "Receta" : "OTC"}
            color={farmaco.requiereReceta ? "error" : "primary"}
            size="small"
          />

          <Chip
            label={`Riesgo ${farmaco.nivelRiesgo}`}
            color={colorRiesgo[farmaco.nivelRiesgo]}
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  )
}