import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";
import SucursalSelector from "./SucursalSelector";
import useBranchStore from "../store/useBranchStore";
import axios from "axios";

export default function PromotionForm() {
  const { handleSubmit, control, reset } = useForm();
  const { selectedBranchId } = useBranchStore();

  const onSubmit = async (data) => {
    if (!selectedBranchId) {
      alert("Por favor seleccioná una sucursal antes de continuar.");
      return;
    }

    const dataWithSucursal = {
      ...data,
      branchId: selectedBranchId,
    };
console.log("dataWithSucursal",dataWithSucursal)
    try {
     await axios.post(import.meta.env.VITE_API_URL+"/promotions",  dataWithSucursal )

      alert("Promoción creada correctamente");
      reset();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Crear nueva promoción
      </Typography>

      <SucursalSelector />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="title"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Nombre de la promoción"
                  fullWidth
                  required
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="startDate"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Fecha de inicio"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="endDate"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Fecha de fin"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" type="submit">
              Crear promoción
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
