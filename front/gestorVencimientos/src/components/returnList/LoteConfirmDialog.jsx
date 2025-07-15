import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// --- El schema dinámico con contexto
const validationSchema = yup.object().shape({
  batchNumber: yup.string().when([], {
    is: (_, context) => context?.requiresBatch,
    then: (schema) => schema.required("El número de lote es obligatorio"),
    otherwise: (schema) => schema.notRequired(),
  }),
  serialNumber: yup.string().when([], {
    is: (_, context) => context?.requiresSerial,
    then: (schema) => schema.required("El número de serie es obligatorio"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function LoteConfirmDialog({ open, onClose, onConfirm, lot }) {
  // Define si se requiere lote y/o serie
  const requiresBatch = !!lot?.batchNumber;
  const requiresSerial = !!lot?.serialNumber;

  const resolver = useMemo(
    () =>
      yupResolver(validationSchema, {
        context: {
          requiresBatch,
          requiresSerial,
        },
      }),
    [requiresBatch, requiresSerial]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      batchNumber: "",
      serialNumber: "",
    },
    resolver,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data) => {
    onConfirm(data); // Devuelve batchNumber y serialNumber
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirmar Lote y Serie</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {requiresBatch && (
            <Controller
              name="batchNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número de lote"
                  fullWidth
                  error={!!errors.batchNumber}
                  helperText={errors.batchNumber?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />
          )}
          {requiresSerial && (
            <Controller
              name="serialNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número de serie"
                  fullWidth
                  error={!!errors.serialNumber}
                  helperText={errors.serialNumber?.message}
                />
              )}
            />
          )}
          {!requiresBatch && !requiresSerial && (
            <Box>No se requieren datos adicionales para este lote.</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
