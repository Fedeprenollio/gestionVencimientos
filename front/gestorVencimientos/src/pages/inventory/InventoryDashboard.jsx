import React, { useEffect, useMemo, useState } from "react";
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
import {
  agruparRecepcionesDesdeSucursales,
  agruparVentas,
  calcularDSIPorProducto,
  calcularProductosDeMovimientoLento,
  detectarProductosQuePerdieronRotacion,
  listarProductosRecibidos,
  mapearDevolucionesConProductos,
} from "../../../utils/calculations";
import InventoryIndicators from "./InventoryIndicators";
import { clearMovimientos, getMovimientos } from "../../../utils/indexedDB";
import SucursalSelector from "../../components/SucursalSelector";
import ProductListSelector from "../../components/ProductListSelector";
import useProductListStore from "../../store/useProductListStore";
import useInventoryStore from "../../store/useInventoryStore";

export default function InventoryDashboard() {
  const { productsFromSelectedLists, usarTodosLosProductos } =
    useProductListStore();
  const {
    setIndicatorsData,
    setDevolucionesPorVencimiento,
    setMovimientoLento,
    movimientoPerdido, setMovimientoPerdido
  } = useInventoryStore();

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
  const barcodesKey = useMemo(() => {
    return productsFromSelectedLists
      .map((p) => p.barcode)
      .sort()
      .join(",");
  }, [productsFromSelectedLists]);

  useEffect(() => {
    const datosListos = stock.length > 0 && movimientos.length > 0;
    if (datosListos) {
      procesarDatos();
    }
  }, [stock, movimientos, filters, barcodesKey, usarTodosLosProductos]);

  const procesarDatos = () => {
    //CALCULO DE DIAS DE INVATIO Y PERDIDAS PROYECTADAS

    console.log("usarTodosLosProductos", usarTodosLosProductos);
    let stockFiltrado =
      usarTodosLosProductos || productsFromSelectedLists.length === 0
        ? stock
        : stock.filter((item) =>
            productsFromSelectedLists.some(
              (p) => p.barcode === String(item.Codebar).trim()
            )
          );
    if (filters.excluirStockNegativo) {
      stockFiltrado = stockFiltrado.filter(
        (item) => parseFloat(item.Cantidad) >= 0
      );
    }

    if (filters.excluirSinStock) {
      stockFiltrado = stockFiltrado.filter(
        (item) => parseFloat(item.Cantidad) > 0
      );
    }

    if (filters.excluirSinVentas) {
      const ventasIds = Object.keys(agruparVentas(movimientos));
      stockFiltrado = stockFiltrado.filter((item) =>
        ventasIds.includes(String(item.IDProducto))
      );
    }

    const ventasPorProducto = agruparVentas(movimientos);
    const resultadoDSI = calcularDSIPorProducto(
      stockFiltrado,
      ventasPorProducto
    );

    resultadoDSI.sort((a, b) => {
      if (a.dsi === Infinity) return -1;
      if (b.dsi === Infinity) return 1;
      return b.dsi - a.dsi;
    });

    const productosCriticos = resultadoDSI
      .filter((item) => item.dsi >= 365 && item.stock > 0 && item.costo > 0)
      .map((item) => {
        const unidadesPerdidas = Math.max(0, item.stock - item.ventasAnuales);
        const perdidaProyectada = unidadesPerdidas * item.costo;
        return { ...item, unidadesPerdidas, perdidaProyectada };
      });

    const stockNormalizado = resultadoDSI.map((item) => ({
      IDProducto: item.IDProducto,
      normalizado: item.ventasAnuales > 0 ? item.stock / item.ventasAnuales : 0,
    }));

    setIndicatorsData({
      dsiData: resultadoDSI,
      stockNormalizado,
      unidadesPerdidas: productosCriticos,
    });

    setVentas(ventasPorProducto);


    //CALCULO DE MOVIMIENO PERDIDO
     const data = detectarProductosQuePerdieronRotacion(movimientos, stockFiltrado);
      console.log("DATA",data)
      setMovimientoPerdido(data);

    //CALCULAR MOVIMIENTO LENTO
    const productosLentos = calcularProductosDeMovimientoLento(
      movimientos,
      stockFiltrado
    );
    setMovimientoLento(productosLentos);

    //CALCULO VENCIDOS

    const devoluciones = mapearDevolucionesConProductos(movimientos, stockFiltrado);
    setDevolucionesPorVencimiento(devoluciones);

    //CALCULO DE RECEPCION DE OTRAS SUCURALES
    const recepcionesPorProducto =
      agruparRecepcionesDesdeSucursales(movimientos);
    const productosRecibidos = listarProductosRecibidos(
      recepcionesPorProducto,
      stockFiltrado
    );

    const setProductosRecibidos =
      useInventoryStore.getState().setProductosRecibidos;
    setProductosRecibidos(productosRecibidos);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Inventario
      </Typography>
      <SucursalSelector />
      <ProductListSelector />
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
        ventas={ventas}
        filters={filters}
        setFilters={setFilters}
        movimientos={movimientos}
        stock={stock}
      />
    </Box>
  );
}
