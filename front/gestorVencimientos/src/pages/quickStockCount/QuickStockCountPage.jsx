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
import StockCountListPage from "./StockCountListPage";

export default function QuickStockCountPage() {

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Crear listas de stock
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/stock-count/new"
        sx={{ mb: 2 }}
      >
        Crear nueva lista
      </Button>

    

    
    </Box>
  );
}
