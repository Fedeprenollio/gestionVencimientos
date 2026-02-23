import { Box, Typography, Divider, Alert } from "@mui/material";

export default function SeccionDosis({ farmaco, tipoPaciente }) {

  const esPediatrico =
    tipoPaciente === "pediatrico" && farmaco.dosisPediatrica;

  return (
    <Box>

      {/* =========================
          DOSIS PEDIÁTRICA
      ========================== */}
      {esPediatrico ? (
        <>
          <Typography variant="h6" gutterBottom>
            Dosis pediátrica
          </Typography>

          <Typography>
            {farmaco.dosisPediatrica.mgPorKg} mg/kg{" "}
            {farmaco.dosisPediatrica.intervaloHoras}
          </Typography>

          <Typography variant="caption" display="block" sx={{ mb: 2 }}>
            Máximo: {farmaco.dosisPediatrica.maximaMgKgDia} mg/kg/día
          </Typography>

          {/* =========================
              REGLA MOSTRADOR (ml)
          ========================== */}
          {farmaco.reglaMostrador && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">
                Regla práctica (ml)
              </Typography>

              {farmaco.reglaMostrador.presentaciones.map((p, i) => (
                <Box key={i} sx={{ mt: 1 }}>
                  <Typography fontWeight="bold">
                    {p.nombre}
                  </Typography>
                  <Typography>{p.regla}</Typography>
                  {p.detalle && (
                    <Typography variant="caption">
                      {p.detalle}
                    </Typography>
                  )}
                </Box>
              ))}
            </>
          )}

          {/* =========================
              REGLAS GOTAS
          ========================== */}
          {farmaco.reglasGotas && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">
                Regla en gotas
              </Typography>

              {farmaco.reglasGotas.map((g, i) => (
                <Box key={i} sx={{ mt: 1 }}>
                  <Typography fontWeight="bold">
                    {g.concentracion}
                  </Typography>
                  <Typography>
                    {g.regla} {g.intervalo}
                  </Typography>
                  {g.detalle && (
                    <Typography variant="caption">
                      {g.detalle}
                    </Typography>
                  )}
                </Box>
              ))}
            </>
          )}
        </>
      ) : (
        /* =========================
            DOSIS ADULTO
        ========================== */
        <>
          <Typography variant="h6" gutterBottom>
            Dosis adulto
          </Typography>

          <Typography>
            {farmaco.dosisHabitual.adulto}
          </Typography>

          <Typography variant="caption">
            Máximo: {farmaco.dosisHabitual.maximaDiaria}
          </Typography>
        </>
      )}
    </Box>
  );
}