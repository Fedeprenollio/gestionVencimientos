import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

export default function ProductCreateModal({
  open,
  onClose,
  barcode,
  onCreate,
  isLoading,
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "medicamento",
    },
  });

  const onSubmit = (data) => {
    onCreate({ ...data, barcode });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear nuevo producto</DialogTitle>
      <DialogContent>
        <TextField
          label="Código de barra"
          value={barcode}
          disabled
          fullWidth
          margin="dense"
          InputProps={{ readOnly: true }}
        />

        <Controller
          name="name"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              margin="dense"
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ""}
              autoFocus
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="dense">
              <InputLabel>Tipo</InputLabel>
              <Select {...field} label="Tipo">
                <MenuItem value="medicamento">Medicamento</MenuItem>
                <MenuItem value="perfumeria">Perfumería</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Crear producto"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
