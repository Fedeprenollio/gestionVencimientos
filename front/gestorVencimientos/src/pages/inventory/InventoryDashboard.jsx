import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import ExcelUploader from "../../components/ExcelUploader";

import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  agruparVentas,
  calcularDSIPorProducto,
} from "../../../utils/calculations";
import InventoryIndicators from "./InventoryIndicators";
import { clearMovimientos, getMovimientos } from "../../../utils/indexedDB";

export default function InventoryDashboard() {
  const [movimientos, setMovimientos] = useState([]);
  const [movimientosMeta, setMovimientosMeta] = useState(null);
  const [stock, setStock] = useState([]);
  const [stockMeta, setStockMeta] = useState(null);

  const [dsiResultado, setDsiResultado] = useState([]);
  const [ventas, setVentas] = useState({});
  const [filters, setFilters] = useState({
    excluirStockNegativo: true,
    excluirSinVentas: false,
    excluirSinStock: false,
  });

  const handleSetMovimientos = (data) => {
    setMovimientos(data);
  };
  useEffect(() => {}, []);

  const handleSetStock = (data) => {
    setStock(data);
    localStorage.setItem("stock", JSON.stringify(data));
  };
  useEffect(() => {
    const savedStock = localStorage.getItem("stock");

    if (savedStock) setStock(JSON.parse(savedStock));
  }, []);

  useEffect(() => {
    async function cargarMovimientosGuardados() {
      const datosGuardados = await getMovimientos();
      if (datosGuardados?.length) {
        setMovimientos(datosGuardados);
      }
    }
    cargarMovimientosGuardados();
    const meta = localStorage.getItem("movimientos_meta");
    if (meta) setMovimientosMeta(JSON.parse(meta));
  }, []);

  useEffect(() => {
    // Cargar stock y su metadata
    const savedStock = localStorage.getItem("stock");
    if (savedStock) setStock(JSON.parse(savedStock));

    const savedStockMeta = localStorage.getItem("stock_meta");
    if (savedStockMeta) setStockMeta(JSON.parse(savedStockMeta));
  }, []);

  useEffect(() => {
  const datosListos = stock.length > 0 && movimientos.length > 0;
  if (datosListos) {
    procesarDatos();
  }
}, [stock, movimientos]); // 🔁 se recalcula cada vez que se cargan

  const procesarDatos = () => {
    const ventasPorProducto = agruparVentas(movimientos);
    const resultadoDSI = calcularDSIPorProducto(stock, ventasPorProducto);

    resultadoDSI.sort((a, b) => {
      if (a.dsi === Infinity) return -1;
      if (b.dsi === Infinity) return 1;
      return b.dsi - a.dsi;
    });

    setDsiResultado(resultadoDSI);
    setVentas(ventasPorProducto); // <-- nuevo
  };
  console.log("dsiResultado", dsiResultado);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Inventario
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <ExcelUploader
          label="📥 Cargar movimientos"
          onDataParsed={handleSetMovimientos}
          tipo="movimientos"
          onMetaParsed={setMovimientosMeta}
        />
        <ExcelUploader
          label="📥 Cargar stock actual"
          onDataParsed={handleSetStock}
          onMetaParsed={setStockMeta}
          tipo="stock"
        />
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            localStorage.removeItem("stock_meta");
            localStorage.removeItem("movimientos_meta");
            localStorage.removeItem("stock");
            clearMovimientos();
            setMovimientos([]);
            setStock([]);
            setDsiResultado([]);
            setStockMeta(null);
            setMovimientosMeta(null);
          }}
        >
          Limpiar datos guardados
        </Button>

        <Button
          variant="contained"
          onClick={procesarDatos}
          disabled={movimientos.length === 0 || stock.length === 0}
        >
          Calcular DSI
        </Button>
      </Stack>
      {/* Mostrar metadata de archivos */}
      {movimientosMeta && (
        <Typography variant="caption" color="text.secondary" mb={1}>
          Archivo movimientos cargado: <b>{movimientosMeta.fileName}</b> el{" "}
          {new Date(movimientosMeta.uploadDate).toLocaleString()}
        </Typography>
      )}
      <Divider />
      {stockMeta && (
        <Typography variant="caption" color="text.secondary" mb={2}>
          Archivo stock cargado: <b>{stockMeta.fileName}</b> el{" "}
          {new Date(stockMeta.uploadDate).toLocaleString()}
        </Typography>
      )}
      <InventoryIndicators
        movimientos={movimientos}
        stock={stock}
        ventas={ventas}
        dsiData={dsiResultado}
        filters={filters}
        setFilters={setFilters}
      />
    </Box>
  );
}
