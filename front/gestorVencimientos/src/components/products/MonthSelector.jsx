
import React from "react";
import { Box, Button, Typography } from "@mui/material";

const months = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
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