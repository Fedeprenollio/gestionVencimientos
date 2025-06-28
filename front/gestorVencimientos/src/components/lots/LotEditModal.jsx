// src/components/lots/LotEditModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import dayjs from "dayjs";
import { BRANCHES } from "../../constants/branches"; // si usás constante para sucursales

export default function LotEditModal({ open, lot, onChange, onClose, onSave }) {
  if (!lot) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar lote</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Cantidad"
            type="number"
            value={lot.quantity}
            onChange={(e) =>
              onChange({ ...lot, quantity: Number(e.target.value) })
            }
            fullWidth
          />
          <TextField
            label="Mes vencimiento (MM)"
            value={dayjs(lot.expirationDate).format("MM")}
            onChange={(e) => {
              const newDate = dayjs(lot.expirationDate)
                .set("month", Number(e.target.value) - 1)
                .toISOString();
              onChange({ ...lot, expirationDate: newDate });
            }}
          />
          <TextField
            label="Año vencimiento (YYYY)"
            value={dayjs(lot.expirationDate).format("YYYY")}
            onChange={(e) => {
              const newDate = dayjs(lot.expirationDate)
                .set("year", Number(e.target.value))
                .toISOString();
              onChange({ ...lot, expirationDate: newDate });
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Sucursal</InputLabel>
            <Select
              value={lot.branch}
              onChange={(e) =>
                onChange({ ...lot, branch: e.target.value })
              }
              label="Sucursal"
            >
              {BRANCHES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={lot.overstock}
                onChange={(e) =>
                  onChange({ ...lot, overstock: e.target.checked })
                }
              />
            }
            label="Sobrestock"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" onClick={onSave}>
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
