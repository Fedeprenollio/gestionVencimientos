import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import useBranchStore from "../store/useBranchStore";
import { useForm, Controller } from "react-hook-form";

export default function PromotionList() {
  const { selectedBranchId } = useBranchStore();
  const [promotions, setPromotions] = useState([]);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const { control, handleSubmit, reset } = useForm();

  const fetchPromotions = async () => {
    if (!selectedBranchId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/promotions?branchId=${selectedBranchId}`
      );
      setPromotions(res.data);
    } catch (err) {
      console.error("Error al obtener promociones:", err);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [selectedBranchId]);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que querés eliminar esta promoción?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/promotions/${id}`);
        fetchPromotions();
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  const handleEditOpen = (promotion) => {
    setEditingPromotion(promotion);
    reset({
      title: promotion.title,
      startDate: promotion.startDate.slice(0, 10),
      endDate: promotion.endDate.slice(0, 10),
    });
  };

  const handleEditSubmit = async (data) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/promotions/${editingPromotion._id}`,
        { ...data, branchId: selectedBranchId }
      );
      setEditingPromotion(null);
      fetchPromotions();
    } catch (err) {
      console.error("Error al actualizar promoción:", err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Promociones de la sucursal
      </Typography>

      {promotions.length === 0 ? (
        <Typography variant="body2">No hay promociones cargadas.</Typography>
      ) : (
        promotions.map((promo) => (
          <Box
            key={promo._id}
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle1">{promo.title}</Typography>
                <Typography variant="body2">
                  {promo.startDate.slice(0, 10)} a {promo.endDate.slice(0, 10)}
                </Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => handleEditOpen(promo)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(promo._id)}>
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))
      )}

      <Dialog open={!!editingPromotion} onClose={() => setEditingPromotion(null)}>
        <DialogTitle>Editar promoción</DialogTitle>
        <form onSubmit={handleSubmit(handleEditSubmit)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField label="Título" fullWidth required {...field} />
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
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      {...field}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingPromotion(null)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Guardar cambios
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
