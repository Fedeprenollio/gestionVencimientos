import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { getProductListsByBranch, deleteProductList } from "../../api/listApi";
import {
  Box,
  MenuItem,
  Select,
  Typography,
  List,
  CircularProgress,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { exportToTXT } from "../../../utils/exportUtils";
import ProductLabelManager from "../price/ProductLabelManager";
import { Checkbox, FormControlLabel } from "@mui/material"; // Agregá esto
import { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add"; // al inicio del archivo
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";

export default function BranchListSelector() {
  const [selectedLists, setSelectedLists] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem("lastSelectedBranch") || "";
  });
  const [listToDelete, setListToDelete] = useState(null); // 👈 lista a eliminar

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem("lastSelectedBranch", selectedBranch);
    }
  }, [selectedBranch]);

  function exportToExcel(rows, fileName = "productos.xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, fileName);
  }

  const handleExportExcel = (list) => {
    const rows =
      list.products?.map((p) => ({
        Codebar: p.product?.barcode?.trim() || "",
        Producto: p.product?.name || "",
      })) || [];

    exportToExcel(rows, `etiquetas_${list.name.replace(/\s+/g, "_")}.xlsx`);
  };

  const toggleListSelection = (listId) => {
    setSelectedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

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

  // useEffect(() => {
  //   if (lists && lists.length > 0) {
  //     setSelectedLists(lists.map((l) => l._id)); // seleccionadas todas por defecto
  //   }
  // }, [lists]);

  // 🔥 Mutación para eliminar lista
  const deleteMutation = useMutation({
    mutationFn: (listId) => deleteProductList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries(["productListsByBranch", selectedBranch]);
      setListToDelete(null); // cerrar diálogo
    },
  });

  const handleExport = (list) => {
    const codes =
      list.products?.map((p) => p.product?.barcode?.trim()).filter(Boolean) ||
      [];

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
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        color="success"
        // disabled={selectedLists.length === 0}
        onClick={() =>
          navigate("/lists/upload-prices-multiple", {
            state: { selectedListIds: selectedLists },
          })
        }
      >
        Actualizar precios de listas seleccionadas
      </Button>
      <Button
        sx={{ mb: 2 }}
        variant="contained"
        color="secondary"
        onClick={() => navigate(`/historial-cargas?branch=${selectedBranch}`)}
        disabled={!selectedBranch}
      >
        Ver historial de cambios de precios de la sucursal
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
              <Box display="flex" flexDirection="column" gap={1}>
                {/* Encabezado: checkbox + nombre */}
                <Box display="flex" alignItems="center" gap={1}>
                  {/* <Checkbox
                    checked={selectedLists.includes(list._id)}
                    onChange={() => toggleListSelection(list._id)}
                  /> */}
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {list.name}
                  </Typography>
                </Box>

                {/* Botones con diseño responsive */}
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={1}
                  flexWrap="wrap"
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/lists/${list._id}/add-products`)}
                  >
                    Agregar productos
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(`/lists/${list._id}/analyze-sales?type=list`)
                    }
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
                    onClick={() => handleExportExcel(list)}
                  >
                    Descargar Excel
                  </Button>

                  {/* <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    onClick={() => navigate(`/list/${list._id}/analyze-prices`)}
                  >
                    Analizar precios
                  </Button> */}

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(`/listas/${list._id}/historial-cargas`)
                    }
                  >
                    Ver historial de precios
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setListToDelete(list)}
                  >
                    Eliminar
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={!!listToDelete} onClose={() => setListToDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas eliminar la lista <b>{listToDelete?.name}</b>? Esta
          acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => deleteMutation.mutate(listToDelete._id)}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* <ProductLabelManager /> */}
    </Box>
  );
}
