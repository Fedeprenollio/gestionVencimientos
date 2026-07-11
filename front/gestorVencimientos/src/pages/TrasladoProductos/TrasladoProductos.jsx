import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";


import { assignProducts } from "./assignProducts";
import OrigenTable from "../AsiganacionesDeStocks/OrigenTable";
import DestinoTable from "../AsiganacionesDeStocks/DestinoTable";
import { loadExcel } from "../AsiganacionesDeStocks/loadExcel";
import { exportToExcel } from "../AsiganacionesDeStocks/excelService";
import { prepareMovements } from "../AsiganacionesDeStocks/prepareMovements";
import ConflictosTable from "./ConflictosTable/ConflictosTable";
import { buildConflicts } from "./buildConflicts";

export default function TrasladoProductos() {
  const [groupedBySucursal, setGroupedBySucursal] = useState({});
  const [groupedByOrigen, setGroupedByOrigen] = useState({});
  const [tab, setTab] = useState(0);
  const [conflicts, setConflicts] = useState([]);
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const rows = await loadExcel(file);

      const result = assignProducts(rows);

      // Agregar propiedades a cada movimiento
      prepareMovements(result.groupedBySucursal);
      const conflicts = buildConflicts(result.groupedBySucursal);

      setGroupedBySucursal(result.groupedBySucursal);
      setGroupedByOrigen(result.groupedByOrigen);
      setConflicts(conflicts);
    } catch (error) {
      console.error(error);
      alert("No se pudo procesar el archivo Excel.");
    }
  };
const guardarConflicto = (conflict, cantidades) => {
  conflict.movimientos.forEach((m) => {
    if (cantidades[m.id] === undefined) return;

    const nuevaCantidad = Number(cantidades[m.id]);

    m.cantidadTrasladar = nuevaCantidad;

    // Si finalmente NO se traslada
    if (nuevaCantidad === 0) {
      m.sucursalDestino = "";
      m.ventasDestino = 0;
      m.stockDestino = 0;

      if (conflict.tipo === "rotacion") {
        m.nota =
          "✔ No se traslada porque se estima que se venderá en la sucursal antes del vencimiento.";
      }

      if (conflict.tipo === "duplicado") {
        m.nota =
          "❌ Traslado descartado durante la revisión de conflictos.";
      }
    }
  });

  setGroupedBySucursal({ ...groupedBySucursal });
  setGroupedByOrigen({ ...groupedByOrigen });

  setConflicts(buildConflicts(groupedBySucursal));
};
//   // Actualizar cantidades
//   conflict.movimientos.forEach((m) => {
//     m.cantidadTrasladar = Number(cantidades[m.id]) || 0;
//   });

//   // Fuerza render
//   setGroupedBySucursal((prev) => ({ ...prev }));
//   setGroupedByOrigen((prev) => ({ ...prev }));

//   // Recalcula conflictos
//   const nuevosConflictos = buildConflicts(groupedBySucursal);

//   setConflicts(nuevosConflictos);
// };
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Plan de Traslado de Productos Críticos
      </Typography>

      <Button variant="contained" component="label">
        Cargar Excel
        <input type="file" hidden onChange={handleFileUpload} />
      </Button>

      {Object.keys(groupedBySucursal).length > 0 && (
        <>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mt: 3 }}
          >
            <Tab label="Distribución por Destino" />
            <Tab label="Pedidos por Origen" />
            <Tab label={`Conflictos (${conflicts.length})`} />
          </Tabs>

          {tab === 0 && (
            <DestinoTable
              groupedBySucursal={groupedBySucursal}
              exportToExcel={exportToExcel}
            />
          )}
          {tab === 1 && <OrigenTable groupedByOrigen={groupedByOrigen} />}
          {tab === 2 && (
            <ConflictosTable
    conflicts={conflicts}
    guardarConflicto={guardarConflicto}
    groupedBySucursal={groupedBySucursal}
    groupedByOrigen={groupedByOrigen}
/>
          )}
        </>
      )}
    </Box>
  );
}
