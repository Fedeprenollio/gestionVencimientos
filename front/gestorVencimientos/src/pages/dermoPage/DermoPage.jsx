import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import * as XLSX from 'xlsx';

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const STORAGE_KEY =
  'dermo-excel-generator';

const createNewSheet = (
  index = 1
) => ({
  id: Date.now() + index,
  sheetName: `Hoja ${index}`,
  jsonInput: ''
});

const DermoPage = () => {
  // =========================
  // STATES
  // =========================

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [fileName, setFileName] =
    useState('Mayo');

  const [activeTab, setActiveTab] =
    useState(0);

  const [sheets, setSheets] =
    useState([
      {
        id: 1,
        sheetName: 'Cassara',
        jsonInput: ''
      }
    ]);

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      severity: 'success',
      message: ''
    });

  const [
    previewOpen,
    setPreviewOpen
  ] = useState(false);

  const [
    previewData,
    setPreviewData
  ] = useState([]);

  const [
    previewStats,
    setPreviewStats
  ] = useState({
    totalProductos: 0,
    totalCategorias: 0
  });

  // =========================
  // LOAD LOCAL STORAGE
  // =========================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (parsed.fileName) {
          setFileName(
            parsed.fileName
          );
        }

        if (
          parsed.sheets &&
          Array.isArray(
            parsed.sheets
          )
        ) {
          setSheets(
            parsed.sheets
          );
        }

        if (
          typeof parsed.activeTab ===
          'number'
        ) {
          setActiveTab(
            parsed.activeTab
          );
        }
      }
    } catch (err) {
      console.error(
        'Error loading localStorage',
        err
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // =========================
  // SAVE LOCAL STORAGE
  // =========================

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fileName,
          sheets,
          activeTab
        })
      );
    } catch (err) {
      console.error(
        'Error saving localStorage',
        err
      );
    }
  }, [
    isLoaded,
    fileName,
    sheets,
    activeTab
  ]);

  // =========================

  const showMessage = (
    message,
    severity = 'success'
  ) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const sanitizeSheetName = (
    name
  ) => {
    return (name || 'Hoja')
      .replace(/[\\/?*[\]]/g, '')
      .slice(0, 31);
  };

  const fixEncoding = (
    text
  ) => {
    if (!text) return '';

    try {
      return decodeURIComponent(
        escape(text)
      );
    } catch {
      return text;
    }
  };

  const currentSheet =
    sheets[activeTab];

  // =========================
  // PRODUCT COUNT
  // =========================

  const totalProductos =
    useMemo(() => {
      try {
        if (
          !currentSheet?.jsonInput
        )
          return 0;

        const parsed =
          JSON.parse(
            currentSheet.jsonInput
          );

        const source =
          parsed.d ||
          (Array.isArray(parsed)
            ? parsed
            : []);

        return source.reduce(
          (acc, linea) => {
            return (
              acc +
              (linea.productos
                ?.length || 0)
            );
          },
          0
        );
      } catch {
        return 0;
      }
    }, [currentSheet]);

  // =========================
  // SHEET HANDLERS
  // =========================

  const handleSheetChange = (
    field,
    value
  ) => {
    setSheets((prev) =>
      prev.map(
        (sheet, index) =>
          index === activeTab
            ? {
                ...sheet,
                [field]: value
              }
            : sheet
      )
    );
  };

  const handleAddSheet = () => {
    const newSheet =
      createNewSheet(
        sheets.length + 1
      );

    setSheets((prev) => [
      ...prev,
      newSheet
    ]);

    setActiveTab(
      sheets.length
    );
  };

  const handleDeleteSheet = (
    index
  ) => {
    if (sheets.length === 1) {
      showMessage(
        'Debe existir al menos una hoja.',
        'warning'
      );

      return;
    }

    const updatedSheets =
      sheets.filter(
        (_, i) => i !== index
      );

    setSheets(
      updatedSheets
    );

    if (
      activeTab >=
      updatedSheets.length
    ) {
      setActiveTab(
        updatedSheets.length - 1
      );
    }
  };

  const handleClearStorage =
    () => {
      localStorage.removeItem(
        STORAGE_KEY
      );

      window.location.reload();
    };

  // =========================
  // JSON EXTRACTION
  // =========================

  const extractRowsFromJson =
    (jsonInput) => {
      const parsedData =
        JSON.parse(jsonInput);

      const source =
        parsedData.d ||
        (Array.isArray(
          parsedData
        )
          ? parsedData
          : []);

      const dataRows = [];

      source.forEach(
        (linea) => {
          const descuentoLinea =
            linea.dctoLinea !==
            undefined
              ? linea.dctoLinea
              : 0;

          const categoriaNombre =
            fixEncoding(
              linea.nombre ||
                linea.nombreLinea ||
                'General'
            );

          if (
            Array.isArray(
              linea.productos
            )
          ) {
            linea.productos.forEach(
              (prod) => {
                const codigo =
                  prod.ean ||
                  prod.EAN ||
                  prod.codigoProducto ||
                  'N/A';

                const nombreProd =
                  fixEncoding(
                    prod.nombreProducto ||
                      prod.nombre ||
                      'Sin nombre'
                  );

                dataRows.push({
                  Categoría:
                    categoriaNombre,
                  'EAN / Código':
                    codigo,
                  Descuento: `${descuentoLinea}%`,
                  'Nombre del Producto':
                    nombreProd
                });
              }
            );
          }
        }
      );

      return dataRows;
    };

  // =========================
  // PREVIEW
  // =========================

  const handlePreview =
    () => {
      try {
        if (
          !currentSheet?.jsonInput?.trim()
        ) {
          showMessage(
            'No hay JSON para previsualizar.',
            'warning'
          );

          return;
        }

        const rows =
          extractRowsFromJson(
            currentSheet.jsonInput
          );

        const categorias =
          new Set(
            rows.map(
              (r) =>
                r['Categoría']
            )
          );

        setPreviewStats({
          totalProductos:
            rows.length,
          totalCategorias:
            categorias.size
        });

        setPreviewData(
          rows.slice(0, 20)
        );

        setPreviewOpen(true);
      } catch (err) {
        console.error(err);

        showMessage(
          'JSON inválido.',
          'error'
        );
      }
    };

  // =========================
  // DOWNLOAD EXCEL
  // =========================

  const handleDownload =
    () => {
      try {
        const workbook =
          XLSX.utils.book_new();

        let totalSheets = 0;

        sheets.forEach(
          (sheet) => {
            if (
              !sheet.jsonInput.trim()
            )
              return;

            const dataRows =
              extractRowsFromJson(
                sheet.jsonInput
              );

            if (
              !dataRows.length
            )
              return;

            const worksheet =
              XLSX.utils.json_to_sheet(
                dataRows
              );

            worksheet[
              '!cols'
            ] = [
              { wch: 25 },
              { wch: 20 },
              { wch: 12 },
              { wch: 60 }
            ];

            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              sanitizeSheetName(
                sheet.sheetName
              )
            );

            totalSheets++;
          }
        );

        if (!totalSheets) {
          showMessage(
            'No hay hojas válidas para exportar.',
            'warning'
          );

          return;
        }

        XLSX.writeFile(
          workbook,
          `${
            fileName ||
            'archivo'
          }.xlsx`
        );

        showMessage(
          `Excel generado correctamente (${totalSheets} hojas).`
        );
      } catch (error) {
        console.error(error);

        showMessage(
          'Error al procesar uno de los JSON.',
          'error'
        );
      }
    };

  // =========================
  // RENDER
  // =========================

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 5 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4
        }}
      >
        <Stack spacing={3}>
          {/* HEADER */}

          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
            >
              📦 Extractor
              Multi-Hoja
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={1}
            >
              Genera múltiples
              hojas Excel desde
              distintos JSON.
            </Typography>
          </Box>

          <Divider />

          {/* FILE NAME */}

          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
          >
            <TextField
              label="Nombre del archivo"
              value={fileName}
              onChange={(e) =>
                setFileName(
                  e.target.value
                )
              }
              helperText="Sin .xlsx"
              fullWidth
            />

            <Button
              variant="outlined"
              color="error"
              startIcon={
                <DeleteSweepIcon />
              }
              onClick={
                handleClearStorage
              }
            >
              Limpiar Todo
            </Button>
          </Stack>

          {/* STORAGE STATUS */}

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Guardado
            automáticamente en
            el navegador
          </Typography>

          {/* TABS */}

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Tabs
                value={activeTab}
                onChange={(
                  e,
                  value
                ) =>
                  setActiveTab(
                    value
                  )
                }
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  flex: 1
                }}
              >
                {sheets.map(
                  (
                    sheet,
                    index
                  ) => (
                    <Tab
                      key={
                        sheet.id
                      }
                      label={
                        <Stack
                          direction="row"
                          spacing={
                            1
                          }
                          alignItems="center"
                        >
                          <span>
                            {
                              sheet.sheetName
                            }
                          </span>

                          <IconButton
                            size="small"
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();

                              handleDeleteSheet(
                                index
                              );
                            }}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Stack>
                      }
                    />
                  )
                )}
              </Tabs>

              <Button
                variant="outlined"
                startIcon={
                  <AddIcon />
                }
                onClick={
                  handleAddSheet
                }
              >
                Agregar
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* ACTIVE SHEET */}

          {currentSheet && (
            <Stack spacing={3}>
              <TextField
                label="Nombre de la hoja"
                value={
                  currentSheet.sheetName
                }
                onChange={(e) =>
                  handleSheetChange(
                    'sheetName',
                    e.target.value
                  )
                }
                fullWidth
              />

              {/* TEXTAREA */}

              <TextField
                multiline
                fullWidth
                label="JSON"
                placeholder="Pega el JSON aquí..."
                value={
                  currentSheet.jsonInput
                }
                onChange={(e) =>
                  handleSheetChange(
                    'jsonInput',
                    e.target.value
                  )
                }
                sx={{
                  '& .MuiInputBase-root':
                    {
                      height: 420,
                      alignItems:
                        'flex-start'
                    },
                  '& textarea': {
                    height:
                      '100% !important',
                    overflow:
                      'auto !important',
                    fontFamily:
                      'Consolas, monospace',
                    fontSize: 13
                  }
                }}
              />

              {/* FOOTER */}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Chip
                  label={`${totalProductos} productos detectados`}
                  color={
                    totalProductos
                      ? 'success'
                      : 'default'
                  }
                />

                <Stack
                  direction="row"
                  spacing={2}
                >
                  <Button
                    variant="outlined"
                    startIcon={
                      <PreviewIcon />
                    }
                    onClick={
                      handlePreview
                    }
                  >
                    Vista previa
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      <DownloadIcon />
                    }
                    onClick={
                      handleDownload
                    }
                  >
                    Generar
                    Excel
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* PREVIEW DIALOG */}

      <Dialog
        open={previewOpen}
        onClose={() =>
          setPreviewOpen(false)
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Vista previa -{' '}
          {
            currentSheet?.sheetName
          }
        </DialogTitle>

        <DialogContent>
          <Stack
            direction="row"
            spacing={2}
            mb={3}
          >
            <Chip
              label={`${previewStats.totalProductos} productos`}
              color="primary"
            />

            <Chip
              label={`${previewStats.totalCategorias} categorías`}
              color="secondary"
            />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  Categoría
                </TableCell>

                <TableCell>
                  Código
                </TableCell>

                <TableCell>
                  Descuento
                </TableCell>

                <TableCell>
                  Producto
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {previewData.map(
                (
                  row,
                  index
                ) => (
                  <TableRow
                    key={index}
                  >
                    <TableCell>
                      {
                        row[
                          'Categoría'
                        ]
                      }
                    </TableCell>

                    <TableCell>
                      {
                        row[
                          'EAN / Código'
                        ]
                      }
                    </TableCell>

                    <TableCell>
                      {
                        row[
                          'Descuento'
                        ]
                      }
                    </TableCell>

                    <TableCell>
                      {
                        row[
                          'Nombre del Producto'
                        ]
                      }
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setPreviewOpen(
                false
              )
            }
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(
            (prev) => ({
              ...prev,
              open: false
            })
          )
        }
        anchorOrigin={{
          vertical:
            'bottom',
          horizontal:
            'right'
        }}
      >
        <Alert
          severity={
            snackbar.severity
          }
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DermoPage;