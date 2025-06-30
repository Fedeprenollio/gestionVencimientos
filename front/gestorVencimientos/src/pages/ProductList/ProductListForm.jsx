import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { createList, fetchListById, updateList } from "../../api/listApi";

const schema = yup.object().shape({
  name: yup.string().required("Nombre requerido"),
  branch: yup.string().required("Sucursal requerida"),
});

export default function ProductListForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
const [searchParams] = useSearchParams();
const branchFromQuery = searchParams.get("branch");
console.log("branchFromQuery",branchFromQuery)
  // Obtener sucursales
  const {
  data: branches = [],
  isLoading: loadingBranches,
  error: errorBranches,
} = useQuery({
  queryKey: ["branches"],
  queryFn: fetchBranches,
});


  // Si está editando: obtener la lista
 const {
  data: listData,
  isLoading: loadingList,
  error: errorList,
} = useQuery({
  queryKey: ["productList", id],
  queryFn: () => fetchListById(id),
  enabled: !!id,
});


  // Prellenar el form si estamos editando
useEffect(() => {
  if (id && listData) {
    reset({
      name: listData.name,
      branch: listData.branch,
    });
  } else if (!id && branchFromQuery) {
    reset({
      branch: branchFromQuery,
    });
  }
}, [id, listData, reset, branchFromQuery,branches]);


  // useEffect(() => {
  //   if (listData) {
  //     reset({
  //       name: listData.name,
  //       branch: listData.branch,
  //     });
  //   }
  // }, [listData, reset]);

  // Mutación para crear/editar
  const mutation = useMutation({
    mutationFn: (data) =>
      id ? updateList(id, data) : createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["productLists"]);
      navigate("/lists");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Box p={3} maxWidth={500}>
      <Typography variant="h5" gutterBottom>
        {id ? "Editar lista de productos" : "Nueva lista de productos"}
      </Typography>

      {loadingBranches || (id && loadingList) ? (
        <CircularProgress />
      ) : errorBranches || errorList ? (
        <Alert severity="error">Error al cargar los datos</Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Nombre de la lista"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Sucursal"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!errors.branch}
                  helperText={errors.branch?.message}
                >
                  {branches.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Button
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading
                ? "Guardando..."
                : id
                ? "Guardar cambios"
                : "Crear lista"}
            </Button>
          </form>
        </Paper>
      )}
    </Box>
  );
}
