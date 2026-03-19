import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { getProductListsByBranch, deleteProductList, updateProductListName } from "../../api/listApi";
import {
  Box,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  List,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { exportToTXT } from "../../../utils/exportUtils";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import * as XLSX from "xlsx";

export default function BranchListSelector() {
  const [listToRename, setListToRename] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [selectedLists, setSelectedLists] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem("lastSelectedBranch") || "";
  });

  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem("lastSelectedBranch", selectedBranch);
    }
  }, [selectedBranch]);

  // ---------------- EXPORT EXCEL ----------------

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


const getDisplayBarcode = (product) => {
  if (!product) return "";

  if (product.alternateBarcodes?.length > 0) {
    return product.alternateBarcodes[0].trim();
  }

  return product.barcode?.trim();
};

const handleExportTXT = (list) => {
  const codes =
    list.products
      ?.map((p) => getDisplayBarcode(p.product))
      .filter(Boolean) || [];

  exportToTXT(codes, `etiquetas_${list.name.replace(/\s+/g, "_")}.txt`);
};

  // const handleExportTXT = (list) => {
  //   const codes =
  //     list.products?.map((p) => p.product?.barcode?.trim()).filter(Boolean) ||
  //     [];

  //   exportToTXT(codes, `etiquetas_${list.name.replace(/\s+/g, "_")}.txt`);
  // };

  // ---------------- QUERIES ----------------

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

  // ---------------- DELETE LIST ----------------

  const deleteMutation = useMutation({
    mutationFn: (listId) => deleteProductList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries(["productListsByBranch", selectedBranch]);
      setListToDelete(null);
    },
  });

  //-------------CAMBIAR EL NOMBRE DE LISTA
  const renameMutation = useMutation({
    mutationFn: ({ listId, name }) => updateProductListName(listId, name),
    onSuccess: () => {
      queryClient.invalidateQueries(["productListsByBranch", selectedBranch]);
      setListToRename(null);
      setNewListName("");
    },
  });

  // ---------------- RENDER ----------------

  return (
    <Box p={3} maxWidth={900} mx="auto">
      <Typography variant="h5" gutterBottom>
        Listas de productos por sucursal
      </Typography>

      {/* selector sucursal */}

      {loadingBranches ? (
        <CircularProgress />
      ) : errorBranches ? (
        <Typography color="error">Error al cargar sucursales</Typography>
      ) : (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Sucursal</InputLabel>

          <Select
            label="Sucursal"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <MenuItem value="" disabled>
              Seleccione una sucursal
            </MenuItem>

            {branches.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* botones globales */}

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/lists/new?branch=${selectedBranch}`)}
          disabled={!selectedBranch}
        >
          Crear nueva lista
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={() =>
            navigate("/lists/upload-prices-multiple", {
              state: { selectedListIds: selectedLists },
            })
          }
        >
          Actualizar precios
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate(`/historial-cargas?branch=${selectedBranch}`)}
          disabled={!selectedBranch}
        >
          Historial de precios
        </Button>
      </Box>

      {/* listas */}

      {loadingLists ? (
        <CircularProgress />
      ) : errorLists ? (
        <Typography color="error">Error al cargar listas</Typography>
      ) : lists.length === 0 ? (
        <Typography>No hay listas para esta sucursal</Typography>
      ) : (
        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {lists.map((list) => (
            <Card key={list._id} elevation={2}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6">{list.name}</Typography>

                    <Chip
                      label={`${list.products?.length || 0} productos`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box display="flex" gap={1}>
                    <Tooltip title="Exportar Excel">
                      <IconButton onClick={() => handleExportExcel(list)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Historial de precios">
                      <IconButton
                        onClick={() =>
                          navigate(`/listas/${list._id}/historial-cargas`)
                        }
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Cambiar nombre">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setListToRename(list);
                          setNewListName(list.name);
                        }}
                      >
                        <EditIcon /> {/* O puedes usar EditIcon si quieres */}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar lista">
                      <IconButton
                        color="error"
                        onClick={() => setListToDelete(list)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>

              <CardActions
                sx={{
                  px: 2,
                  pb: 2,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/lists/${list._id}/add-products`)}
                >
                  Editar lista
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleExportTXT(list)}
                >
                  TXT Plex
                </Button>

                {/* 
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    navigate(`/lists/${list._id}/analyze-sales?type=list`)
                  }
                >
                  Analizar ventas
                </Button>
                */}
              </CardActions>
            </Card>
          ))}
        </List>
      )}

      {/* dialogo eliminar */}

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
      <Dialog
  open={!!listToRename}
  onClose={() => setListToRename(null)}
>
  <DialogTitle>Renombrar lista</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Nuevo nombre"
      fullWidth
      value={newListName}
      onChange={(e) => setNewListName(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setListToRename(null)}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={() =>
        renameMutation.mutate({ listId: listToRename._id, name: newListName })
      }
      disabled={renameMutation.isLoading}
    >
      {renameMutation.isLoading ? "Guardando..." : "Guardar"}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}
