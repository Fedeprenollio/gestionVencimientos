import {
  Tabs,
  Tab,
  Box,
  Stack,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import DaysOfInventoryCard from "./DaysOfInventoryCard";
import ProjectedLossCard from "./ProjectedLossCard";
import HelpDialog from "./HelpDialog";
import ProductosRecibidosCard from "./ProductosRecibidosCard";
import ProductosDevueltosVencimientoCard from "./ProductosDevueltosVencimientoCard";
import MovimientoLentoDataGrid from "./MovimientoLentoDataGrid";
import ProductosPerdieronRotacionGrid from "./ProductosPerdieronRotacionGrid";
import IndiceMermaMensualChart from "./IndiceMermaMensualChart";

export default function InventoryIndicators({
  movimientos,
  stock,
  // dsiData,
  setFilters,
  filters,
}) {
  // const { filters, setFilters } = useInventoryStore();
  const [tab, setTab] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const handleChange = (key) => (event) =>
    setFilters((prev) => ({ ...prev, [key]: event.target.checked }));

  return (
    <div>
      <h2>Indicadores de Inventario</h2>

      <Stack direction="row" spacing={2} mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.excluirStockNegativo}
              onChange={handleChange("excluirStockNegativo")}
            />
          }
          label="Excluir productos con stock negativo"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.excluirSinVentas}
              onChange={handleChange("excluirSinVentas")}
            />
          }
          label="Excluir productos sin ventas"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.excluirSinStock}
              onChange={handleChange("excluirSinStock")}
            />
          }
          label="Excluir productos sin stock"
        />
      </Stack>
      <Button variant="outlined" onClick={() => setHelpOpen(true)}>
        ¿Qué significan estos indicadores?
      </Button>

      <Box sx={{ overflowX: "auto" }}>
        <Tabs
          value={tab}
          onChange={(e, newTab) => setTab(newTab)}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="📦 Días de Inventario" />
          <Tab label="💸 Pérdidas proyectadas" />
          <Tab label="💸 Pedidos a sucursales" />
          <Tab label="💸 Devolucion vencimientos" />
          <Tab label="💸 Lenta rotacion" />
          <Tab label="💸 Perdida de rotacion" />
          <Tab label="📉 Merma mensual" />
        </Tabs>
      </Box>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Box hidden={tab !== 0}>
        {tab === 0 && (
          <DaysOfInventoryCard
            movimientos={movimientos}
            stock={stock}
            filters={filters}
          />
        )}
      </Box>

      <Box hidden={tab !== 1}>{tab === 1 && <ProjectedLossCard />}</Box>
      <Box hidden={tab !== 2}>{tab === 2 && <ProductosRecibidosCard />}</Box>
      <Box hidden={tab !== 3}>
        {tab === 3 && <ProductosDevueltosVencimientoCard />}
      </Box>
      <Box hidden={tab !== 4}>{tab === 4 && <MovimientoLentoDataGrid />}</Box>
      <Box hidden={tab !== 5}>
        {tab === 5 && (
          <ProductosPerdieronRotacionGrid
            stock={stock}
            movimientos={movimientos}
          />
        )}
      </Box>
      <Box hidden={tab !== 6}>{tab === 6 && <IndiceMermaMensualChart />}</Box>
    </div>
  );
}
