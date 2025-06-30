import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBranch, fetchBranches } from "../../api/branchApi";

export default function BranchList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que querés eliminar esta sucursal?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Typography>Cargando...</Typography>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Sucursales</Typography>
        <Button variant="contained" onClick={() => navigate("/branches/new")}>
          Nueva Sucursal
        </Button>
      </Stack>

      {branches.map((branch) => (
        <Paper key={branch._id} sx={{ p: 2, mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>
              <strong>{branch.name}</strong> - {branch.location}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => navigate(`/branches/${branch._id}`)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(branch._id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
