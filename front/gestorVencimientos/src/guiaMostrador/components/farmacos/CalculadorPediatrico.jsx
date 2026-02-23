import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";

export default function CalculadorPediatrico({ farmaco, forma }) {
  const [peso, setPeso] = useState("");

  if (!farmaco?.dosisPediatrica || !forma?.permiteCalculoPediatrico)
    return null;

  const mgPorKg = farmaco.dosisPediatrica.mgPorKg;

  const mgNecesarios = peso * mgPorKg;

  const ml = forma.concentracionMgPorMl
    ? (mgNecesarios / forma.concentracionMgPorMl).toFixed(2)
    : null;

  const gotas = forma.mgPorGota
    ? (mgNecesarios / forma.mgPorGota).toFixed(0)
    : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2">
        Calculador pediátrico
      </Typography>

      <TextField
        label="Peso (kg)"
        size="small"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        sx={{ mt: 1 }}
      />

      {peso && (
        <Box sx={{ mt: 2 }}>
          <Typography>
            Dosis: {mgNecesarios} mg
          </Typography>

          {ml && (
            <Typography>
              Equivale a: {ml} ml
            </Typography>
          )}

          {gotas && (
            <Typography>
              Equivale a: {gotas} gotas
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}