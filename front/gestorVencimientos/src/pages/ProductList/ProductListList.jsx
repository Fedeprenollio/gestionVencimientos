

// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { fetchBranches } from "../../api/branchApi";
// import { getProductListsByBranch } from "../../api/listApi";
// import {
//   Box,
//   MenuItem,
//   Select,
//   Typography,
//   List,
//   ListItem,
//   CircularProgress,
//   Button,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function BranchListSelector() {
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const navigate = useNavigate();

//   const {
//     data: branches = [],
//     isLoading: loadingBranches,
//     error: errorBranches,
//   } = useQuery({
//     queryKey: ["branches"],
//     queryFn: fetchBranches,
//   });
//   console.log("SUCURS", branches);
//   const {
//     data: lists = [],
//     isLoading: loadingLists,
//     error: errorLists,
//   } = useQuery({
//     queryKey: ["productListsByBranch", selectedBranch],
//     queryFn: () => getProductListsByBranch(selectedBranch),
//     enabled: !!selectedBranch,
//   });

//   return (
//     <Box p={3}>
//       <Typography variant="h6" gutterBottom>
//         Selecciona una sucursal
//       </Typography>
//       {loadingBranches ? (
//         <CircularProgress />
//       ) : errorBranches ? (
//         <Typography color="error">Error al cargar sucursales</Typography>
//       ) : (
//         <Select
//           value={selectedBranch}
//           onChange={(e) => setSelectedBranch(e.target.value)}
//           displayEmpty
//           fullWidth
//           sx={{ mb: 3 }}
//         >
//           <MenuItem value="" disabled>
//             -- Seleccione una sucursal --
//           </MenuItem>
//           {branches?.map((b) => (
//             <MenuItem key={b._id} value={b._id}>
//               {b.name}
//             </MenuItem>
//           ))}
//         </Select>
//       )}

//       <Button
//         variant="contained"
//         color="primary"
//         sx={{ mb: 2 }}
//         onClick={() => {
//           // ir a ruta de creación o abrir modal
//           navigate(`/lists/new?branch=${selectedBranch}`);
//         }}
//         disabled={!selectedBranch}
//       >
//         Crear nueva lista para esta sucursal
//       </Button>

//       {/* <ProductQuickSearch
//         onSelect={(product) => console.log("Seleccionado", product)}
//       /> */}

//       {loadingLists ? (
//         <CircularProgress />
//       ) : errorLists ? (
//         <Typography color="error">Error al cargar listas</Typography>
//       ) : (
//         <List>
//           <List>
//             {lists?.length ? (
//               lists.map((list) => (
//                 <>
//                 <ListItem
//                   key={list._id}
//                   secondaryAction={
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() =>
//                         navigate(`/lists/${list._id}/add-products`)
//                       }
//                     >
//                       Agregar productos
//                     </Button>
//                   }
//                 >
//                   {list.name}
//                 </ListItem>
//                 <Button
//   variant="outlined"
//   onClick={() => navigate(`/lists/${list._id}/analyze-sales`)}
// >
//   Analizar ventas
// </Button>

//                 </>
//               ))
//             ) : (
//               <Typography>No hay listas para esta sucursal</Typography>
//             )}
//           </List>
//         </List>
//       )}
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
  Paper,
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
          {branches.map((b) => (
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
        onClick={() => navigate(`/lists/new?branch=${selectedBranch}`)}
        disabled={!selectedBranch}
      >
        Crear nueva lista para esta sucursal
      </Button>

      {loadingLists ? (
        <CircularProgress />
      ) : errorLists ? (
        <Typography color="error">Error al cargar listas</Typography>
      ) : lists.length === 0 ? (
        <Typography>No hay listas para esta sucursal</Typography>
      ) : (
        <List>
          {lists.map((list) => (
            <Paper
              key={list._id}
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "rgba(0,0,0,0.04)", // fondo suave oscuro
                borderRadius: 2,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: { xs: 1, sm: 0 } }}
                >
                  {list.name}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/lists/${list._id}/add-products`)}
                  >
                    Agregar productos
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/lists/${list._id}/analyze-sales`)}
                  >
                    Analizar ventas
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
}
