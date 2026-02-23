import { useState, useMemo } from "react"
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid
} from "@mui/material"
import { farmacosData } from "../data/farmacos"
import FarmacoCard from "./FarmacoCard"

export default function BuscadorFarmacos() {
  const [texto, setTexto] = useState("")
  const [filtroReceta, setFiltroReceta] = useState("todos")
  const [filtroRiesgo, setFiltroRiesgo] = useState("todos")

  const resultados = useMemo(() => {
    return farmacosData.filter(f => {
      const t = texto.toLowerCase()

      const matchTexto =
        f.nombre.toLowerCase().includes(t) ||
        f.grupo.toLowerCase().includes(t) ||
        f.sintomasRelacionados?.some(s =>
          s.toLowerCase().includes(t)
        )

      const matchReceta =
        filtroReceta === "todos" ||
        f.requiereReceta === (filtroReceta === "receta")

      const matchRiesgo =
        filtroRiesgo === "todos" ||
        f.nivelRiesgo === filtroRiesgo

      return matchTexto && matchReceta && matchRiesgo
    })
  }, [texto, filtroReceta, filtroRiesgo])

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        label="Buscar por nombre, síntoma o grupo..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filtroReceta}
              label="Tipo"
              onChange={(e) => setFiltroReceta(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="otc">OTC</MenuItem>
              <MenuItem value="receta">Receta</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Riesgo</InputLabel>
            <Select
              value={filtroRiesgo}
              label="Riesgo"
              onChange={(e) => setFiltroRiesgo(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {resultados.map(f => (
          <Grid item xs={12} md={6} key={f.id}>
            <FarmacoCard farmaco={f} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}