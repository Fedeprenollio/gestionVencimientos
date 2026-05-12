import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

export default function OfertasToExcel() {
  const [tabs, setTabs] = useState([
    {
      id: Date.now(),
      name: "Hoja 1",
      json: "",
    },
  ]);

  const [activeTab, setActiveTab] = useState(0);

  const [error, setError] = useState("");

  const currentTab = useMemo(
    () => tabs[activeTab],
    [tabs, activeTab],
  );

  const handleAddTab = () => {
    const newTabs = [
      ...tabs,
      {
        id: Date.now(),
        name: `Hoja ${tabs.length + 1}`,
        json: "",
      },
    ];

    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
  };

  const handleDeleteTab = (index) => {
    if (tabs.length === 1) return;

    const updatedTabs = tabs.filter(
      (_, i) => i !== index,
    );

    setTabs(updatedTabs);

    if (activeTab >= updatedTabs.length) {
      setActiveTab(updatedTabs.length - 1);
    }
  };

  const handleChangeJson = (value) => {
    setTabs((prev) =>
      prev.map((tab, index) =>
        index === activeTab
          ? {
              ...tab,
              json: value,
            }
          : tab,
      ),
    );
  };

  const handleChangeName = (value) => {
    setTabs((prev) =>
      prev.map((tab, index) =>
        index === activeTab
          ? {
              ...tab,
              name: value,
            }
          : tab,
      ),
    );
  };

  const parseProducts = (jsonText) => {
    const parsed = JSON.parse(jsonText);

    // Categoria sacada automáticamente del JSON
    const category = parsed?.data?.title || "";

    const products =
      parsed?.data?.submodules?.flatMap(
        (submodule) => submodule.products || [],
      ) || [];

    return products.map((product) => ({
      Categoria: category,

      Laboratorio: product.lab || "",

      "Código de Barra": String(
        product.codeBar || "",
      ).trim(),

      Nombre: product.productName || "",

      Precio: product.pvp || 0,

      Descuento:
        (product.discountPercentage || 0) / 100,

      "Precio con Descuento":
        product.discountPrice || 0,

      Stock:
        product.stockStatus?.trim() === "F"
          ? "Sin Stock"
          : "Con Stock",
    }));
  };

  const applyStyles = (worksheet, dataLength) => {
    worksheet["!cols"] = [
      { wch: 28 }, // categoria
      { wch: 30 }, // laboratorio
      { wch: 20 }, // barcode
      { wch: 55 }, // nombre
      { wch: 14 }, // precio
      { wch: 14 }, // descuento
      { wch: 20 }, // precio descuento
      { wch: 14 }, // stock
    ];

    for (let i = 2; i <= dataLength + 1; i++) {
      if (worksheet[`E${i}`]) {
        worksheet[`E${i}`].z = "$#,##0.00";
      }

      if (worksheet[`F${i}`]) {
        worksheet[`F${i}`].z = "0.00%";
      }

      if (worksheet[`G${i}`]) {
        worksheet[`G${i}`].z = "$#,##0.00";
      }
    }
  };

  const handleGenerateExcel = () => {
    try {
      setError("");

      const workbook = XLSX.utils.book_new();

      let allProducts = [];

      tabs.forEach((tab) => {
        if (!tab.json.trim()) return;

        const products = parseProducts(tab.json);

        allProducts = [...allProducts, ...products];

        const worksheet =
          XLSX.utils.json_to_sheet(products);

        applyStyles(worksheet, products.length);

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          tab.name.substring(0, 31),
        );
      });

      // Hoja consolidada
      if (allProducts.length > 0) {
        const allWorksheet =
          XLSX.utils.json_to_sheet(allProducts);

        applyStyles(
          allWorksheet,
          allProducts.length,
        );

        XLSX.utils.book_append_sheet(
          workbook,
          allWorksheet,
          "Todos los Productos",
        );
      }

      XLSX.writeFile(
        workbook,
        `productos_${Date.now()}.xlsx`,
      );
    } catch (err) {
      console.error(err);
      setError("Uno de los JSON es inválido.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <AppBar
        position="static"
        color="inherit"
        elevation={1}
      >
        <Toolbar>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
              >
                JSON → Excel
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Multi hojas + consolidado
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTab}
              >
                Agregar Hoja
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={handleGenerateExcel}
              >
                Descargar Excel
              </Button>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) =>
                setActiveTab(newValue)
              }
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  label={
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <span>{tab.name}</span>

                      <Chip
                        size="small"
                        label={index + 1}
                      />

                      {tabs.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTab(index);
                          }}
                        >
                          <DeleteIcon
                            fontSize="small"
                          />
                        </IconButton>
                      )}
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  Configuración de Hoja
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  El nombre será usado solamente
                  como nombre de hoja.
                  <br />
                  La columna "Categoria" se obtiene
                  automáticamente del JSON.
                </Typography>
              </Box>

              {/* Nombre hoja */}
              <TextField
                label="Nombre de Hoja"
                fullWidth
                value={currentTab.name}
                onChange={(e) =>
                  handleChangeName(e.target.value)
                }
              />

              {/* JSON */}
              <TextField
                multiline
                fullWidth
                value={currentTab.json}
                onChange={(e) =>
                  handleChangeJson(e.target.value)
                }
                placeholder="Pegá acá el JSON..."
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: 500,
                    alignItems: "flex-start",
                    overflow: "auto",
                  },

                  "& textarea": {
                    height: "100% !important",
                    overflow: "auto !important",
                    resize: "none",
                    fontFamily: "monospace",
                    fontSize: 13,
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {error && (
          <Typography
            color="error"
            fontWeight="bold"
            mt={2}
          >
            {error}
          </Typography>
        )}
      </Container>
    </Box>
  );
}