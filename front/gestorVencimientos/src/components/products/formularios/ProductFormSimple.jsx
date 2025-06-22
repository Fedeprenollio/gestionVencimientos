import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";

export default function ProductFormSimple({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("medicamento");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "medicamento");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          label="Tipo"
        >
          <MenuItem value="medicamento">Medicamento</MenuItem>
          <MenuItem value="perfumeria">Perfumería</MenuItem>
        </Select>
      </FormControl>

      <Box display="flex" gap={2}>
        <Button type="submit" variant="contained">Actualizar</Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outlined" color="secondary">
            Cancelar
          </Button>
        )}
      </Box>
    </Box>
  );
}
