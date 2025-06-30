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
import { exportToExcel, exportToExcelLots } from "../../../utils/exportUtils";
import axios from "axios";
import LotEditModal from "./LotEditModal";

export default function CreatedLotsTable({ createdLots, onClear, onUpdate }) {
  const [editingLot, setEditingLot] = useState(null);
console.log(createdLots)
  const handleDelete = async (lotId) => {
    const confirmDelete = confirm("¿Eliminar este lote de la lista?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/lots/${lotId}`);
      const updated = createdLots.filter((lot) => lot._id !== lotId);
      onUpdate(updated);
      alert("Lote eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar el lote:", err);
      alert("Error al eliminar el lote");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/lots/${editingLot._id}`,
        editingLot
      );
      const updatedLot = res.data.lot;

      const updated = createdLots.map((lot) =>
        lot._id === updatedLot._id ? updatedLot : lot
      );
      onUpdate(updated);
      setEditingLot(null);
      alert("Lote actualizado con éxito");
    } catch (err) {
      console.error("Error al actualizar el lote:", err);
      alert("Error al actualizar el lote");
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        px: { xs: 1, sm: 2 },
        maxWidth: "1200px", // ancho máximo en pantallas grandes
        mx: "auto", // centra horizontalmente
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">Lotes creados</Typography>
        <Button color="error" onClick={onClear}>
          Limpiar todos
        </Button>
      </Box>
      <Box sx={{ overflowX: { xs: "auto", sm: "visible" } }}>
        <Table size="small" sx={{ minWidth: "600px" }}>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Sucursal</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Sobrestock</TableCell>
              <TableCell>Usuario</TableCell>
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
                <TableCell>{lot.createdBy?.username || "?"}</TableCell>
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
      </Box>

      {/* Modal de edición */}
      {/* <Dialog open={!!editingLot} onClose={() => setEditingLot(null)}>
        <DialogTitle>Editar lote</DialogTitle>
        <DialogContent>
          {editingLot && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
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
      </Dialog> */}
      <LotEditModal
        open={!!editingLot}
        lot={editingLot}
        onChange={setEditingLot}
        onClose={() => setEditingLot(null)}
        onSave={handleSaveEdit}
      />

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => exportToExcelLots(createdLots)}
        >
          Exportar a Excel
        </Button>
      </Box>
    </Box>
  );
}
