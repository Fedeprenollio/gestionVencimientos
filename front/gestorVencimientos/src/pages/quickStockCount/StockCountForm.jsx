import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function StockCountForm({
  initialValues = null,
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialValues?.name || "");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    initialValues?.branch || ""
  );
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/branches");
        setBranches(res);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      }
    };
    fetchBranches();
  }, []);

  const handleSubmit = async () => {
    if (!selectedBranch || !name) return alert("Faltan campos requeridos");

    try {
      setLoading(true);

      const payload = {
        name,
        branchId: selectedBranch,
      };

      if (initialValues && initialValues._id) {
        // Modo edición
        await onSubmit(payload);
      } else {
        // Modo creación
        const res = await api.post("/stock-count", payload);

        if (onSubmit) onSubmit(res);
         navigate(  "/stock-count/" +res._id   )
      }

      if (onClose) onClose();
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? "Editar lista" : "Crear nueva lista de conteo"}
      </Typography>

      <Paper sx={{ p: 2, maxWidth: 500 }}>
        <TextField
          label="Nombre de la lista"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="branch-select-label">Sucursal</InputLabel>
          <Select
            labelId="branch-select-label"
            value={selectedBranch}
            label="Sucursal"
            onChange={(e) => setSelectedBranch(e.target.value)}
            // disabled={!!initialValues?.branch} // Deshabilitar en edición
          >
            {branches?.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          {onClose && (
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !selectedBranch}
          >
            Guardar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
