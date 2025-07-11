import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import axios from "axios";
import CompareAndApplyStockImport from "./CompareAndApplyStockImport";
import useBranchStore from "../../store/useBranchStore";

export default function StockImportHistory() {
  const { selectedBranchId, fetchBranches, branches } = useBranchStore();

  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState(null);
  const [error, setError] = useState(null);

  const fetchImports = async () => {
    if (!selectedBranchId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/stock-imports`, {
        params: { branchId: selectedBranchId },
      });
      setImports(res.data);
    } catch (err) {
      setError("Error al cargar las importaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(); // para asegurarme de tener las sucursales
  }, []);

  useEffect(() => {
    fetchImports();
  }, [selectedBranchId]);

  const branchName =
    branches.find((b) => b._id === selectedBranchId)?.name || "Sucursal";

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Importaciones – {branchName}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {imports.length === 0 ? (
            <Typography>No hay importaciones recientes.</Typography>
          ) : (
            <List dense>
              {imports.map((imp) => (
                <React.Fragment key={imp._id}>
                  <ListItem
                    button
                    selected={selectedImportId === imp._id}
                    onClick={() => setSelectedImportId(imp._id)}
                  >
                    <ListItemText
                      primary={`Importación ${imp._id.slice(-6)} — ${
                        imp.status
                      }`}
                      secondary={new Date(
                        imp.importedAt
                      ).toLocaleString()}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </>
      )}

      {selectedImportId && (
        <Box mt={4}>
          {/* <CompareAndApplyStockImport importId={selectedImportId} /> */}
        </Box>
      )}
    </Paper>
  );
}
