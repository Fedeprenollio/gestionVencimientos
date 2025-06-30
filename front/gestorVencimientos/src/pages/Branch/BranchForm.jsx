// pages/Branch/BranchForm.jsx
import React, { useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  createBranch,
  updateBranch,
  getBranchById,
} from "../../api/branchApi";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const schema = yup.object({
  name: yup.string().required("Nombre requerido"),
  location: yup.string().required("Ubicación requerida"),
});

export default function BranchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Traer la sucursal si es edición
  const { data: branchData } = useQuery({
    queryKey: ["branches", id],
    queryFn: () => getBranchById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (branchData) {
      reset(branchData);
    }
  }, [branchData, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      id ? updateBranch(id, data) : createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      navigate("/branches");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        {id ? "Editar Sucursal" : "Nueva Sucursal"}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Ubicación"
              {...register("location")}
              error={!!errors.location}
              helperText={errors.location?.message}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {id ? "Guardar cambios" : "Crear sucursal"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
