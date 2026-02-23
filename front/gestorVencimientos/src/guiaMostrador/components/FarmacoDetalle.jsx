import { useParams } from "react-router-dom"
import { farmacosData } from "../data/farmacos"
import { Card, CardContent, Typography, Alert, Box } from "@mui/material"

export const FarmacoDetalle = () => {
  const { id } = useParams()
  const farmaco = farmacosData.find(f => f.id === id)

  if (!farmaco) return <Typography>No encontrado</Typography>

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4">{farmaco.nombre}</Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {farmaco.grupo}
          </Typography>

          <Typography variant="h6">Mecanismo de acción</Typography>
          <Typography sx={{ mb: 2 }}>
            {farmaco.mecanismoAccion}
          </Typography>

          <Typography variant="h6">Farmacocinética</Typography>
          <Typography>
            Absorción: {farmaco.farmacocinetica.absorcion}
          </Typography>
          <Typography>
            Metabolismo: {farmaco.farmacocinetica.metabolismo}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Eliminación: {farmaco.farmacocinetica.eliminacion}
          </Typography>

          <Typography variant="h6">Efectos adversos</Typography>
          {farmaco.efectosAdversos.map((e, i) => (
            <Typography key={i}>• {e}</Typography>
          ))}

          <Alert severity="warning" sx={{ mt: 3 }}>
            Embarazo: {farmaco.embarazo}
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}