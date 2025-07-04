// pages/CreateStockCountList.jsx
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
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function CreateStockCountList() {
  const [name, setName] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
console.log("selectedBranch;", selectedBranch)
  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches");
      setBranches(res);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async () => {
    if (!selectedBranch) return alert("Seleccioná una sucursal");

    try {
      setLoading(true);
      const res = await api.post("/stock-count", {
        name,
        branchId: selectedBranch,
        // userId: 
      });
      navigate(`/stock-count/${res._id}`);
    } catch (err) {
      console.error("Error creando lista:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Crear nueva lista de conteo
      </Typography>
      <Paper sx={{ p: 2, mt: 2, maxWidth: 500 }}>
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
          >
            {branches?.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !selectedBranch}
        >
          Crear
        </Button>
      </Paper>
    </Box>
  );
}
