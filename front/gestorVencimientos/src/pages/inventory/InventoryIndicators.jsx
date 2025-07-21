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
import useInventoryStore from "../../store/useInventoryStore";
import ProductosRecibidosCard from "./ProductosRecibidosCard";

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
      <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} sx={{ mb: 2 }}>
        <Tab label="📦 Días de Inventario" />
        <Tab label="💸 Pérdidas proyectadas" />
         <Tab label="💸 Pedidos a sucursales" />
      </Tabs>
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

      <Box hidden={tab !== 1}>
        {tab === 1 && <ProjectedLossCard  />}
      </Box>
<Box hidden={tab !== 2}>
        {tab === 2 && <ProductosRecibidosCard  />}
      </Box>

      
    </div>
  );
}
