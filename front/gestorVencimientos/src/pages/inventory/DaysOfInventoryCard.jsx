import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  Checkbox,
  Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import WarningIcon from "@mui/icons-material/Warning";

import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ListSubheader from "@mui/material/ListSubheader";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { exportToExcel } from "./exporttoexcel";
import useInventoryStore from "../../store/useInventoryStore";


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
      renderCell: (params) => renderDSI(params.value),
    },
    {
      field: "tuvoDevolucionVencimiento",
      headerName: "¿Dev por venc?",
      width: 250,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Sí" color="error" size="small" />
        ) : (
          <Chip label="No" color="default" size="small" />
        ),
    },
  ];
}
function renderDSI(dsi) {
  if (dsi === Infinity) {
    return (
      <Typography>
        ∞ <ReportProblemIcon />
      </Typography>
    );
  }

  let icon = null;
  let color = "";

  if (dsi < 30) {
    icon = <WarningIcon sx={{ color: "error.main", fontSize: 20 }} />;
    color = "error.main";
  } else if (dsi < 90) {
    icon = <AccessTimeIcon sx={{ color: "warning.main", fontSize: 20 }} />;
    color = "warning.main";
  } else {
    icon = <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />;
    color = "success.main";
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ color, fontWeight: 600 }}>{Math.round(dsi)}</Typography>
      {icon}
    </Box>
  );
}

export default function DaysOfInventoryCard({ movimientos,
  //  stock,
    //filters //
  }) {
    const { dsiData, stockNormalizado: stock, unidadesPerdidas } = useInventoryStore();

  const [tab, setTab] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inputValue, setInputValue] = useState("");
const dsiResultado = useMemo(() => {
  if (!dsiData?.length) return [];
  
  // Ya está filtrado y ordenado en el padre
  return dsiData;
}, [dsiData]);

  const productoOptions = useMemo(
    () =>
      [...new Set(dsiResultado.map((item) => item.producto))]
        .sort((a, b) => a.localeCompare(b))
        .map((producto) => ({ title: producto })), // transformás cada string a objeto
    [dsiResultado]
  );
  const [lastValidOptions, setLastValidOptions] = useState(productoOptions);

  // Filtrar opciones solo cuando hay al menos 3 letras
  const filteredOptions = useMemo(() => {
    if (inputValue.length < 3) return lastValidOptions;

    const filtered = productoOptions.filter((option) =>
      option.title.toLowerCase().includes(inputValue.toLowerCase())
    );

    setLastValidOptions(filtered);
    return filtered;
  }, [inputValue, productoOptions]);

  // Agregamos la opción "Seleccionar todos" al inicio
  const optionsWithSelectAll = [{ title: "__selectAll__" }, ...filteredOptions];

  const filterBySelected = (list) =>
    selectedProducts.length === 0
      ? list
      : list.filter((item) =>
          selectedProducts.some((prod) => prod.title === item.producto)
        );

  const promedio =
    dsiResultado.length > 0
      ? dsiResultado.reduce(
          (acc, item) => acc + (item.dsi === Infinity ? 365 : item.dsi),
          0
        ) / dsiResultado.length
      : 0;
  const muyBajo = dsiResultado.filter((row) => row.dsi <= 20);
  const bajo = dsiResultado.filter((row) => row.dsi > 20 && row.dsi <= 60);
  const medio = dsiResultado.filter((row) => row.dsi > 60 && row.dsi <= 180);
  const alto = dsiResultado.filter(
    (row) => row.dsi > 180 || row.dsi === Infinity
  );
  const tabData = [
    {
      label: "🟠 Muy Bajo (Reponer)",
      data: filterBySelected(muyBajo),
      icon: <PriorityHighIcon />,
    },
    {
      label: "🟢 Bajo (OK)",
      data: filterBySelected(bajo),
      icon: <CheckCircleIcon />,
    },
    {
      label: "🟡 Medio",
      data: filterBySelected(medio),
      icon: <AccessTimeIcon />,
    },
    {
      label: "🔴 Alto",
      data: filterBySelected(alto),
      icon: <WarningIcon />,
    },
  ];
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

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

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={optionsWithSelectAll}
        getOptionLabel={(option) =>
          option.title === "__selectAll__" ? "" : option.title
        }
        isOptionEqualToValue={(option, value) => option.title === value.title}
        value={selectedProducts}
        inputValue={inputValue}
        onInputChange={(e, val) => setInputValue(val)}
        onChange={(event, newValue) => {
          // Detectar si se clickeó la opción "Seleccionar todos"
          const last = newValue[newValue.length - 1];
          if (last?.title === "__selectAll__") {
            setSelectedProducts(filteredOptions);
          } else {
            setSelectedProducts(newValue);
          }
        }}
        renderOption={(props, option, { selected }) => {
          if (option.title === "__selectAll__") {
            return (
              <ListSubheader
                key="select-all"
                {...props}
                sx={{ cursor: "pointer" }}
              >
                <Checkbox
                  indeterminate={
                    selectedProducts.length > 0 &&
                    selectedProducts.length < filteredOptions.length
                  }
                  checked={
                    filteredOptions.length > 0 &&
                    selectedProducts.length === filteredOptions.length
                  }
                  tabIndex={-1}
                  disableRipple
                  sx={{ marginRight: 1 }}
                />
                Seleccionar todos
              </ListSubheader>
            );
          }

          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.title}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Seleccionar productos"
            placeholder="Ej: amoxi, ibu..."
            helperText={
              inputValue.length < 3
                ? "Escribí al menos 3 letras para refinar la búsqueda"
                : ""
            }
          />
        )}
      />

    
      <Box display="flex" gap={2} my={2}>
        {/* <Button
          variant="outlined"
          onClick={() => setSelectedProducts(filteredOptions)}
          disabled={filteredOptions.length === 0}
        >
          Seleccionar todos
        </Button> */}

        <Button
          variant="contained"
          color="success"
          onClick={() =>
            exportToExcel({
              modo: "todos",
              dsiResultado, // <-- este es el bueno
              selectedProducts,
            })
          }
          disabled={dsiResultado.length === 0}
        >
          Exportar todos
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            exportToExcel({
              modo: "seleccion",
              dsiResultado,
              selectedProducts,
            })
          }
          disabled={selectedProducts.length === 0}
        >
          Exportar seleccionados
        </Button>
      </Box>

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
