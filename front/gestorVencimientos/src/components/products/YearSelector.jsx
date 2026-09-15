import React from "react";
import { Box, Button, Typography } from "@mui/material";

const years = ["2026", "2027", "2028", "2029"];

export default function YearSelector({ value, onChange }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Año de vencimiento
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
          },
          gap: 1,
        }}
      >
        {years.map((year) => (
          <Button
            key={year}
            variant={value === year ? "contained" : "outlined"}
            color={value === year ? "primary" : "inherit"}
            onClick={() => onChange(year)}
            sx={{
              minWidth: 0,
              minHeight: 44,
              fontWeight: value === year ? 700 : 400,
            }}
          >
            {year}
          </Button>
        ))}
      </Box>
    </Box>
  );
}