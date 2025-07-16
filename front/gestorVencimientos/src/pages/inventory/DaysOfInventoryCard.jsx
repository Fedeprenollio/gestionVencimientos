import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Chip, Tabs, Tab } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  agruparVentas,
  calcularDSIPorProducto,
} from "../../../utils/calculations";

function getDSIColor(dsi) {
  if (dsi === Infinity || dsi > 180) return "error";
  if (dsi > 60) return "warning";
  return "success";
}

function getDSILabel(dsi) {
  if (dsi === Infinity) return "∞";
  return `${dsi.toFixed(0)} días`;
}

function getDSIIcon(dsi) {
  if (dsi === Infinity || dsi > 180) return <ErrorIcon />;
  if (dsi > 60) return <WarningIcon />;
  return <CheckCircleIcon />;
}

function getColumns() {
  return [
    { field: "codebar", headerName: "Código de Barras", width: 160 },

    { field: "producto", headerName: "Producto", flex: 1 },

    { field: "stock", headerName: "Stock", width: 100 },
    { field: "ventasAnuales", headerName: "Ventas Anuales", width: 150 },
    {
      field: "dsi",
      headerName: "DSI",
      width: 160,
      renderCell: (params) => (
        <Chip
          label={getDSILabel(params.value)}
          color={getDSIColor(params.value)}
          icon={getDSIIcon(params.value)}
          variant="outlined"
          size="small"
        />
      ),
    },
  ];
}

export default function DaysOfInventoryCard({ movimientos, stock, filters }) {
  const [tab, setTab] = useState(0);

  const dsiResultado = useMemo(() => {
    if (!movimientos?.length || !stock?.length) return [];

    // Paso 1: Agrupar ventas
    const ventas = agruparVentas(movimientos);

    // Paso 2: Filtrar stock según opciones
    let stockFiltrado = [...stock];

    if (filters?.excluirStockNegativo) {
      stockFiltrado = stockFiltrado.filter((item) => item.Cantidad >= 0);
    }

    // Paso 3: Calcular DSI
    let dsi = calcularDSIPorProducto(stockFiltrado, ventas);

    // Paso 4: Aplicar filtros adicionales
    if (filters?.excluirSinVentas) {
      dsi = dsi.filter((item) => item.ventasAnuales > 0);
    }
    if (filters?.excluirSinStock) {
      dsi = dsi.filter((item) => item.stock > 0);
    }

    // Paso 5: Ordenar por DSI
    dsi.sort((a, b) => {
      if (a.dsi === Infinity) return -1;
      if (b.dsi === Infinity) return 1;
      return b.dsi - a.dsi;
    });

    return dsi;
  }, [movimientos, stock, filters]);

  const promedio =
    dsiResultado.length > 0
      ? dsiResultado.reduce(
          (acc, item) => acc + (item.dsi === Infinity ? 365 : item.dsi),
          0
        ) / dsiResultado.length
      : 0;

  const rojos = dsiResultado.filter(
    (row) => row.dsi === Infinity || row.dsi > 180
  );
  const amarillos = dsiResultado.filter(
    (row) => row.dsi > 60 && row.dsi <= 180
  );
  const verdes = dsiResultado.filter((row) => row.dsi <= 60);

  const tabData = [
    {
      label: "🔴 Alto (Sobrestock)",
      data: rojos,
      icon: <ErrorIcon />,
    },
    {
      label: "🟡 Medio (Revisar)",
      data: amarillos,
      icon: <WarningIcon />,
    },
    {
      label: "🟢 Bajo (Buena rotación)",
      data: verdes,
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Días de Inventario (DSI)</Typography>
        <Typography variant="body1">
          Promedio: {promedio.toFixed(0)} días
        </Typography>
        <Typography variant="caption">
          Calculado sobre {dsiResultado.length} productos con stock y/o ventas.
        </Typography>
      </Paper>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="scrollable"
      >
        {tabData.map((tabItem, index) => (
          <Tab
            key={index}
            label={`${tabItem.label} (${tabItem.data.length})`}
            icon={tabItem.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>

      <Box mt={2}>
        {tabData.map((tabItem, index) => (
          <div key={index} hidden={tab !== index}>
            {tab === index && (
              <DataGrid
                autoHeight
                rows={tabItem.data.map((row, i) => ({ id: i, ...row }))}
                columns={getColumns()}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                components={{ Toolbar: GridToolbar }}
              />
            )}
          </div>
        ))}
      </Box>
    </Box>
  );
}

