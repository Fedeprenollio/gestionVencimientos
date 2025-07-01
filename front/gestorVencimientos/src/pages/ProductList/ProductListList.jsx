import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { getProductListsByBranch } from "../../api/listApi";
import {
  Box,
  MenuItem,
  Select,
  Typography,
  List,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { exportToTXT } from "../../../utils/exportUtils";

export default function BranchListSelector() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const navigate = useNavigate();

  const {
    data: branches = [],
    isLoading: loadingBranches,
    error: errorBranches,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const {
    data: lists = [],
    isLoading: loadingLists,
    error: errorLists,
  } = useQuery({
    queryKey: ["productListsByBranch", selectedBranch],
    queryFn: () => getProductListsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  const handleExport = (list) => {
    const codes =
      list.products?.map((p) => p.barcode?.trim()).filter(Boolean) || [];
    exportToTXT(codes, `etiquetas_${list.name.replace(/\s+/g, "_")}.txt`);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Selecciona una sucursal
      </Typography>

      {loadingBranches ? (
        <CircularProgress />
      ) : errorBranches ? (
        <Typography color="error">Error al cargar sucursales</Typography>
      ) : (
        <Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="" disabled>
            -- Seleccione una sucursal --
          </MenuItem>
          {branches.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate(`/lists/new?branch=${selectedBranch}`)}
        disabled={!selectedBranch}
      >
        Crear nueva lista para esta sucursal
      </Button>

      {loadingLists ? (
        <CircularProgress />
      ) : errorLists ? (
        <Typography color="error">Error al cargar listas</Typography>
      ) : lists.length === 0 ? (
        <Typography>No hay listas para esta sucursal</Typography>
      ) : (
        <List>
          {lists.map((list) => (
            <Paper
              key={list._id}
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "rgba(0,0,0,0.04)",
                borderRadius: 2,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: { xs: 1, sm: 0 } }}
                >
                  {list.name}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/lists/${list._id}/add-products`)}
                  >
                    Agregar productos
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/lists/${list._id}/analyze-sales`)}
                  >
                    Analizar ventas
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => handleExport(list)}
                  >
                    Generar txt para etiquetas
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    onClick={() => navigate(`/list/${list._id}/analyze-prices`)}
                  >
                    Analizar precios
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    onClick={() => navigate(`/lists/${list._id}/upload-prices`)}
                  >
                    Subir precios Excel
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
}
