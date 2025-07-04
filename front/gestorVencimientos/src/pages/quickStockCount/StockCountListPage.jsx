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
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function StockCountListPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [lists, setLists] = useState([]);

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

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Listas de conteo de stock 2
      </Typography>

      <Paper sx={{ p: 2, maxWidth: 400, mb: 3 }}>
        <Typography variant="subtitle1">Seleccioná una sucursal</Typography>
        <Select
          fullWidth
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches?.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {lists.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Listas para {branches.find(b => b._id === selectedBranch)?.name}</Typography>
          <List>
            {lists.map((list) => (
              <ListItem
                key={list._id}
                secondaryAction={
                  <Button
                    component={Link}
                    to={`/stock-count/${list._id}`}
                    variant="outlined"
                    size="small"
                  >
                    Abrir
                  </Button>
                }
              >
                <ListItemText
                  primary={list.name || "Sin nombre"}
                  secondary={new Date(list.createdAt).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
