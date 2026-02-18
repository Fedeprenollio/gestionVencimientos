import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import api from "../../api/axiosInstance";
import useBranchStore from "../../store/useBranchStore";
import SucursalSelector from "../../components/SucursalSelector";

export default function UpdateFromImportForm({result, setResult}) {
  const { selectedBranchId } = useBranchStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedListIds, setSelectedListIds] = useState([]);
  const [lastImportId, setLastImportId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBranchId) return;

      setLoading(true);
      try {
        const [importsRes, listsRes] = await Promise.all([
          api.get(`/imports/recent?branchId=${selectedBranchId}`),
          api.get(`/product-lists/branch/${selectedBranchId}`),
        ]);

        const latestImport = importsRes[0]; // suponiendo ordenado por createdAt desc
        setLastImportId(latestImport?._id || null);
        setLists(listsRes || []);
        console.log("importsRes",importsRes)
      } catch (err) {
        setMessage({
          type: "error",
          text: "Error cargando datos: " + (err.response?.data?.message || err.message),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranchId]);

  const handleApply = async () => {
    if (!selectedBranchId || !lastImportId || selectedListIds.length === 0) {
      setMessage({ type: "error", text: "Faltan datos para aplicar los cambios." });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/imports/apply-to-lists`, {
        importId: lastImportId,
        listIds: selectedListIds,
        branchId: selectedBranchId,
      });
      setResult(res)
      setMessage({
        type: "success",
        text: res?.message || "Actualización exitosa",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.message || "Error al aplicar importación",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Aplicar último import a listas
      </Typography>

      <SucursalSelector />

      {message && (
        <Alert severity={message.type} sx={{ mt: 2, mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {lastImportId ? (
            <Typography variant="body2" color="text.secondary" mb={2}>
              Último import ID: <strong>{lastImportId}</strong>
            </Typography>
          ) : (
            <Alert severity="warning">No hay importaciones recientes</Alert>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="select-listas-label">Listas a actualizar</InputLabel>
            <Select
              labelId="select-listas-label"
              multiple
              value={selectedListIds}
              onChange={(e) => setSelectedListIds(e.target.value)}
              input={<OutlinedInput label="Listas a actualizar" />}
              renderValue={(selected) =>
                selected
                  .map((id) => lists?.find((l) => l._id === id)?.name || id)
                  .join(", ")
              }
            >
              {lists?.map((list) => (
                <MenuItem key={list._id} value={list._id}>
                  <Checkbox checked={selectedListIds?.includes(list._id)} />
                  <ListItemText primary={list.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApply}
              disabled={loading || !lastImportId || selectedListIds.length === 0}
            >
              Aplicar importación a listas
            </Button>
          </Box>
        </>
      )}
      {result && <UploadPricesResultByList data={result} />}
    </Paper>
  );
}
