
import React from "react";
import { Box, Button, Typography } from "@mui/material";

const months = [
  { value: "01", label: "01 / Ene" },
  { value: "02", label: "02 / Feb" },
  { value: "03", label: "03 / Mar" },
  { value: "04", label: "04 / Abr" },
  { value: "05", label: "05 / May" },
  { value: "06", label: "06 / Jun" },
  { value: "07", label: "07 / Jul" },
  { value: "08", label: "08 / Ago" },
  { value: "09", label: "09 / Sep" },
  { value: "10", label: "10 / Oct" },
  { value: "11", label: "11 / Nov" },
  { value: "12", label: "12 / Dic" },
];

export default function MonthSelector({ value, onChange }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Mes de vencimiento
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(4, 1fr)",
            sm: "repeat(6, 1fr)",
          },
          gap: 1,
        }}
      >
        {months.map((month) => (
          <Button
            key={month.value}
            variant={value === month.value ? "contained" : "outlined"}
            color={value === month.value ? "primary" : "inherit"}
            onClick={() => onChange(month.value)}
            sx={{
              minWidth: 0,
              minHeight: 44,
              px: 0.5,
              textTransform: "none",
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              fontWeight: value === month.value ? 700 : 400,
            }}
          >
            {month.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}