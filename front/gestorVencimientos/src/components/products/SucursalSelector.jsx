import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from "@mui/material";

export default function SucursalSelector({ branch, setBranch }) {
  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
      <Typography variant="h6">
        Selecciona una sucursal para empezar
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Sucursal</InputLabel>
        <Select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          label="Sucursal"
        >
          <MenuItem value="sucursal1">Sucursal 1</MenuItem>
          <MenuItem value="sucursal2">Sucursal 2</MenuItem>
          <MenuItem value="sucursal3">Sucursal 3</MenuItem>
          {/* Agregá las que necesites */}
        </Select>
      </FormControl>
    </Box>
  );
}
