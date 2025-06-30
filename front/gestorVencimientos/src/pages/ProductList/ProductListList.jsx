// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Paper,
//   IconButton,
//   Stack,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { Delete, Edit } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { deleteList, fetchLists } from "../../api/listApi";

// export default function ProductListList() {
//   const [lists, setLists] = useState([]);
//   const navigate = useNavigate();

//   const loadLists = async () => {
//     const data = await fetchLists();
//     setLists(data);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("¿Estás seguro de eliminar esta lista?")) {
//       await deleteList(id);
//       loadLists();
//     }
//   };

//   useEffect(() => {
//     loadLists();
//   }, []);

//   const columns = [
//     { field: "name", headerName: "Nombre", flex: 1 },
//     {
//       field: "branch",
//       headerName: "Sucursal",
//       flex: 1,
//       valueGetter: (params) => params.row.branch?.name || "Sin asignar",
//     },
//     {
//       field: "actions",
//       headerName: "Acciones",
//       renderCell: (params) => (
//         <Stack direction="row">
//           <IconButton onClick={() => navigate(`/lists/edit/${params.row._id}`)}>
//             <Edit />
//           </IconButton>
//           <IconButton onClick={() => handleDelete(params.row._id)}>
//             <Delete />
//           </IconButton>
//         </Stack>
//       ),
//     },
//   ];

//   return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom>
//         Listas de productos por sucursal
//       </Typography>
//       <Button
//         variant="contained"
//         onClick={() => navigate("/lists/new")}
//         sx={{ mb: 2 }}
//       >
//         Nueva lista
//       </Button>
//       <Paper sx={{ height: 500 }}>
//         <DataGrid
//           rows={lists?.map((row, i) => ({ id: row._id, ...row }))}
//           columns={columns}
//         />
//       </Paper>
//     </Box>
//   );
// }

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranches } from "../../api/branchApi";
import { getProductListsByBranch } from "../../api/listApi";
import {
  Box,
  MenuItem,
  Select,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BranchListSelector() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const navigate = useNavigate();

  const {
    data: branches = [],
    isLoading: loadingBranches,
    error: errorBranches,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });
  console.log("SUCURS", branches);
  const {
    data: lists = [],
    isLoading: loadingLists,
    error: errorLists,
  } = useQuery({
    queryKey: ["productListsByBranch", selectedBranch],
    queryFn: () => getProductListsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Selecciona una sucursal
      </Typography>
      {loadingBranches ? (
        <CircularProgress />
      ) : errorBranches ? (
        <Typography color="error">Error al cargar sucursales</Typography>
      ) : (
        <Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="" disabled>
            -- Seleccione una sucursal --
          </MenuItem>
          {branches?.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => {
          // ir a ruta de creación o abrir modal
          navigate(`/lists/new?branch=${selectedBranch}`);
        }}
        disabled={!selectedBranch}
      >
        Crear nueva lista para esta sucursal
      </Button>

      {/* <ProductQuickSearch
        onSelect={(product) => console.log("Seleccionado", product)}
      /> */}

      {loadingLists ? (
        <CircularProgress />
      ) : errorLists ? (
        <Typography color="error">Error al cargar listas</Typography>
      ) : (
        <List>
          <List>
            {lists?.length ? (
              lists.map((list) => (
                <>
                  <ListItem
                    key={list._id}
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          navigate(`/lists/${list._id}/add-products`)
                        }
                      >
                        Agregar productos
                      </Button>
                    }
                  >
                    {list.name}
                  </ListItem>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/lists/${list._id}/analyze-sales`)}
                  >
                    Analizar ventas
                  </Button>
                </>
              ))
            ) : (
              <Typography>No hay listas para esta sucursal</Typography>
            )}
          </List>
        </List>
      )}
    </Box>
  );
}
