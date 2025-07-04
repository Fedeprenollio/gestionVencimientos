// pages/StockCountListPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import StockCountListPage from "./StockCountListPage";

export default function QuickStockCountPage() {
  const [lists, setLists] = useState([]);

  const fetchLists = async () => {
    try {
      const res = await api.get("/stock-count");
      setLists(res.data);
    } catch (err) {
      console.error("Error cargando listas de conteo:", err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Listas de conteo de stock 1
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/stock-count/new"
        sx={{ mb: 2 }}
      >
        Crear nueva lista
      </Button>

      <Paper>
        <List>
          {lists?.map((list) => (
            <React.Fragment key={list._id}>
              <ListItem
                button
                component={Link}
                to={`/stock-count/${list._id}`}
              >
                <ListItemText
                  primary={list.name || "Lista sin nombre"}
                  secondary={`Fecha: ${new Date(list.createdAt).toLocaleDateString()}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <StockCountListPage></StockCountListPage>
    </Box>
  );
}
