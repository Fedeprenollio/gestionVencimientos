import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { BRANCHES } from "../../constants/branches";

export default function SucursalSelector({ branch, onBranchChange }) {
  const [editMode, setEditMode] = useState(false);

  // Inicializar sucursal desde localStorage si existe
  useEffect(() => {
    const savedBranch = localStorage.getItem("selected_branch");
    if (savedBranch) {
      onBranchChange(savedBranch);
    }
  }, [onBranchChange]);

  // Guardar sucursal seleccionada en localStorage
  const handleBranchChange = (value) => {
    onBranchChange(value);
    localStorage.setItem("selected_branch", value);
    setEditMode(false); // cerrar edición al seleccionar
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Sucursal seleccionada</Typography>
        {!editMode ? (
          <Button variant="outlined" onClick={() => setEditMode(true)}>
            Cambiar sucursal
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setEditMode(false)}>
            Confirmar
          </Button>
        )}
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Sucursal</InputLabel>
        <Select
          value={branch}
          onChange={(e) => handleBranchChange(e.target.value)}
          label="Sucursal"
          disabled={!editMode}
        >
          {BRANCHES.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
