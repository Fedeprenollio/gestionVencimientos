import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import StockCountForm from "./StockCountForm";

export default function StockCountListPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [lists, setLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingList, setEditingList] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await api.get("/branches");
      setBranches(res);
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      if (!selectedBranch) return;
      const res = await api.get(`/stock-count/branch/${selectedBranch}`);
      setLists(res);
    };
    fetchLists();
  }, [selectedBranch]);

  const currentBranch = branches.find((b) => b._id === selectedBranch);

  const handleDelete = async (listId) => {
    if (window.confirm("¿Seguro que deseas eliminar esta lista?")) {
      await api.delete(`/stock-count/${listId}`);
      setLists((prev) => prev.filter((l) => l._id !== listId));
    }
  };

  const filteredLists = lists.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📋 Listas de stock
      </Typography>

      {/* Cabecera */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="subtitle1" gutterBottom>
            Seleccioná una sucursal
          </Typography>
          <Select
            fullWidth
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              -- Seleccione --
            </MenuItem>
            {branches.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Button
          variant="contained"
          component={Link}
          to="/stock-count/new"
          disabled={!selectedBranch}
          startIcon={<AddIcon />}
        >
          Nueva lista
        </Button>
      </Paper>

      {/* Filtro por nombre */}
      {lists.length > 0 && (
        <TextField
          fullWidth
          placeholder="Buscar por nombre de lista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Listado de listas */}
      {filteredLists.length > 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Listas para: {currentBranch?.name}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {filteredLists.map((list) => (
              <ListItem
                key={list._id}
                secondaryAction={
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/lists/${list._id}/analyze-sales?type=stock`)
                      }
                    >
                      Analizar ventas
                    </Button>
                    <IconButton
                      title="Abrir"
                      component={Link}
                      to={`/stock-count/${list._id}`}
                      color="primary"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                    <IconButton
                      title="Editar"
                      color="info"
                      onClick={() => setEditingList(list)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      title="Eliminar"
                      color="error"
                      onClick={() => handleDelete(list._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={list.name || "Sin nombre"}
                  secondary={`Creada: ${new Date(
                    list.createdAt
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : selectedBranch ? (
        <Typography>No hay listas para esta sucursal aún.</Typography>
      ) : null}
      <Dialog
        open={!!editingList}
        onClose={() => setEditingList(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar lista</DialogTitle>
        <DialogContent>
          <StockCountForm
            initialValues={editingList}
            onSubmit={async (data) => {
              await api.put(`/stock-count/${editingList._id}`, data);
              const updatedLists = lists.map((l) =>
                l._id === editingList._id ? { ...l, name: data.name } : l
              );
              setLists(updatedLists);
              setEditingList(null);
            }}
            onClose={() => setEditingList(null)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
