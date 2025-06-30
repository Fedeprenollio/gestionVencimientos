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
import axios from "axios";

export default function SucursalSelector({ branch, onBranchChange }) {
  const [editMode, setEditMode] = useState(false);
  const [branches, setBranches] = useState([]);
//  await axios.get(
//       `${import.meta.env.VITE_API_URL}/products?${params}`
//     );
  useEffect(() => {
    axios.get( `${import.meta.env.VITE_API_URL}/branches`) // ajustá la URL a tu backend
      .then((res) => {
        setBranches(res.data);
      })
      .catch((error) => {
        console.error("Error al cargar sucursales:", error);
      });
  }, []);

console.log("branches",branches)

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

   // Aquí mezclamos la lista estática y la dinámica en un solo array para mostrar
  // IMPORTANTE: adaptá los campos para que tengan la misma estructura { value, label }
  const combinedBranches = [
    ...BRANCHES,
    ...branches.map(({ _id, name }) => ({
      value: _id,
      label: name,
    })),
  ];

  return (
    <Box sx={{ maxWidth: "70%", mx: "auto", p: 2 }}>
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
           {combinedBranches.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
