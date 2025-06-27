// import React from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Chip,
// } from "@mui/material";
// import { exportToExcelLots, formatDate } from "../../../utils/exportUtils";

// export default function CreatedLotsTable({ createdLots, onClear }) {
//   if (!createdLots || createdLots.length === 0) return null;

//   return (
//     <Box mt={4}>
//       <Typography variant="h6" gutterBottom>
//         Lotes cargados hoy
//       </Typography>
//       <Table size="small">
//         <TableHead>
//           <TableRow>
//             <TableCell>Producto</TableCell>
//             <TableCell>Código</TableCell>
//             <TableCell>Vencimiento</TableCell>
//             <TableCell>Cantidad</TableCell>
//             <TableCell>Sucursal</TableCell>
//             <TableCell>SobreStock</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {createdLots.map((lot, idx) => (
//             <TableRow key={idx}>
//               <TableCell>{lot.name}</TableCell>
//               <TableCell>{lot.barcode}</TableCell>
//               <TableCell>{formatDate(lot.expirationDate)}</TableCell>
//               <TableCell>{lot.quantity}</TableCell>
//               <TableCell>{lot.branch}</TableCell>
//               <TableCell>
//                 {lot.overstock ? (
//                   <Chip label="Sí" color="warning" size="small" />
//                 ) : (
//                   <Chip label="No" variant="outlined" size="small" />
//                 )}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <Box mt={2} display="flex" gap={2}>
//         <Button
//           variant="outlined"
//           onClick={() => exportToExcelLots(createdLots)}
//         >
//           Exportar a Excel
//         </Button>
//         <Button variant="outlined" color="error" onClick={onClear}>
//           Limpiar jornada
//         </Button>
//       </Box>
//     </Box>
//   );
// }


import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import dayjs from "dayjs";

export default function CreatedLotsTable({ createdLots, onClear, onUpdate }) {
  const [editingLot, setEditingLot] = useState(null);

  const handleDelete = (lotId) => {
    const confirmDelete = confirm("¿Eliminar este lote de la lista?");
    if (!confirmDelete) return;

    const updated = createdLots.filter((lot) => lot._id !== lotId);
    onUpdate(updated);
  };

  const handleSaveEdit = () => {
    const updated = createdLots.map((lot) =>
      lot._id === editingLot._id ? editingLot : lot
    );
    onUpdate(updated);
    setEditingLot(null);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle1">Lotes creados</Typography>
        <Button color="error" onClick={onClear}>
          Limpiar todos
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Sucursal</TableCell>
            <TableCell>Vencimiento</TableCell>
            <TableCell>Sobrestock</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {createdLots.map((lot) => (
            <TableRow key={lot._id}>
              <TableCell>{lot.product?.name || "-"}</TableCell>
              <TableCell>{lot.product?.barcode || "-"}</TableCell>
              <TableCell>{lot.product?.type || "-"}</TableCell>
              <TableCell>{lot.quantity}</TableCell>
              <TableCell>{lot.branch}</TableCell>
              <TableCell>
                {dayjs(lot.expirationDate).format("MM/YYYY")}
              </TableCell>
              <TableCell>{lot.overstock ? "Sí" : "No"}</TableCell>
              <TableCell>
                <IconButton onClick={() => setEditingLot({ ...lot })}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleDelete(lot._id)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de edición */}
      <Dialog open={!!editingLot} onClose={() => setEditingLot(null)}>
        <DialogTitle>Editar lote</DialogTitle>
        <DialogContent>
          {editingLot && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Cantidad"
                type="number"
                value={editingLot.quantity}
                onChange={(e) =>
                  setEditingLot((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                fullWidth
              />
              <TextField
                label="Mes vencimiento (MM)"
                value={dayjs(editingLot.expirationDate).format("MM")}
                onChange={(e) => {
                  const newDate = dayjs(editingLot.expirationDate)
                    .set("month", Number(e.target.value) - 1)
                    .toISOString();
                  setEditingLot((prev) => ({
                    ...prev,
                    expirationDate: newDate,
                  }));
                }}
              />
              <TextField
                label="Año vencimiento (YYYY)"
                value={dayjs(editingLot.expirationDate).format("YYYY")}
                onChange={(e) => {
                  const newDate = dayjs(editingLot.expirationDate)
                    .set("year", Number(e.target.value))
                    .toISOString();
                  setEditingLot((prev) => ({
                    ...prev,
                    expirationDate: newDate,
                  }));
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={editingLot.branch}
                  onChange={(e) =>
                    setEditingLot((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                  label="Sucursal"
                >
                  <MenuItem value="sucursal1">Sucursal 1</MenuItem>
                  <MenuItem value="sucursal2">Sucursal 2</MenuItem>
                  {/* Agrega más sucursales si necesitás */}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingLot.overstock}
                    onChange={(e) =>
                      setEditingLot((prev) => ({
                        ...prev,
                        overstock: e.target.checked,
                      }))
                    }
                  />
                }
                label="Sobrestock"
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button onClick={() => setEditingLot(null)}>Cancelar</Button>
                <Button variant="contained" onClick={handleSaveEdit}>
                  Guardar cambios
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
