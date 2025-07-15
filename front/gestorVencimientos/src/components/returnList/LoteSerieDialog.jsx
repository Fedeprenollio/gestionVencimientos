// Al comienzo de tu archivo:
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useForm, Controller, useFormContext, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

// Yup schema para validación de lote y número de serie
const dialogSchema = yup.object({
  batchNumber: yup.string().required("Número de lote requerido"),
  serialNumber: yup.string().required("Número de serie requerido"),
});

function LoteSerieDialog({ open, onClose, onConfirm }) {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(dialogSchema),
    defaultValues: { batchNumber: "", serialNumber: "" },
  });

  const onSubmit = (data) => {
    onConfirm(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Completar datos del lote</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Controller
            name="batchNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Número de lote"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="serialNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Número de serie"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
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
