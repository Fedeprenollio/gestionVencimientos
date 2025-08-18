// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Button,
//   Grid,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { Delete, Edit } from "@mui/icons-material";
// import axios from "axios";
// import useBranchStore from "../store/useBranchStore";
// import { useForm, Controller } from "react-hook-form";
// import usePromoStore from "../store/usePromoStore";

// export default function PromotionList() {
//   const { selectedBranchId } = useBranchStore();
//   // const [promotions, setPromotions] = useState([]);
//   const [editingPromotion, setEditingPromotion] = useState(null);
//   const { control, handleSubmit, reset } = useForm();

//   // 👇 ahora las promos vienen del store global
//   const allPromotions = usePromoStore((s) => s.allPromotions);
//   const getAllPromotions = usePromoStore((s) => s.getAllPromotions);
//   const getExpiredPromotions = usePromoStore((s) => s.getExpiredPromotions);

//   // const fetchPromotions = async () => {
//   //   if (!selectedBranchId) return;

//   //   try {
//   //     const res = await axios.get(
//   //       `${import.meta.env.VITE_API_URL}/promotions?branchId=${selectedBranchId}`
//   //     );
//   //     setPromotions(res.data);
//   //   } catch (err) {
//   //     console.error("Error al obtener promociones:", err);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchPromotions();
//   // }, [selectedBranchId]);
//   useEffect(() => {
//     getAllPromotions(selectedBranchId);
//   }, [selectedBranchId]);

//   const handleDelete = async (id) => {
//     if (confirm("¿Estás seguro que querés eliminar esta promoción?")) {
//       try {
//         await axios.delete(`${import.meta.env.VITE_API_URL}/promotions/${id}`);
//         // fetchPromotions();
//         getAllPromotions(selectedBranchId);
//         getExpiredPromotions(selectedBranchId);
//       } catch (err) {
//         console.error("Error al eliminar:", err);
//       }
//     }
//   };

//   const handleEditOpen = (promotion) => {
//     setEditingPromotion(promotion);
//     reset({
//       title: promotion.title,
//       startDate: promotion.startDate.slice(0, 10),
//       endDate: promotion.endDate.slice(0, 10),
//     });
//   };

//   const handleEditSubmit = async (data) => {
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/promotions/${editingPromotion._id}`,
//         { ...data, branchId: selectedBranchId }
//       );
//       setEditingPromotion(null);
//       // fetchPromotions();
//       getAllPromotions(selectedBranchId);
//       getExpiredPromotions(selectedBranchId);
//     } catch (err) {
//       console.error("Error al actualizar promoción:", err);
//     }
//   };

//   return (
//     <Box sx={{ mt: 4 }}>
//       <Typography variant="h6" gutterBottom>
//         Promociones de la sucursal
//       </Typography>

//       {allPromotions.length === 0 ? (
//         <Typography variant="body2">No hay promociones cargadas.</Typography>
//       ) : (
//         allPromotions.map((promo) => (
//           <Box
//             key={promo._id}
//             sx={{
//               border: "1px solid #ddd",
//               borderRadius: 2,
//               p: 2,
//               mb: 2,
//               backgroundColor: "#f9f9f9",
//             }}
//           >
//             <Grid container alignItems="center" justifyContent="space-between">
//               <Grid item xs={12} sm={8}>
//                 <Typography variant="subtitle1">{promo.title}</Typography>
//                 <Typography variant="body2">
//                   {promo.startDate.slice(0, 10)} a {promo.endDate.slice(0, 10)}
//                 </Typography>
//               </Grid>
//               <Grid item>
//                 <IconButton onClick={() => handleEditOpen(promo)}>
//                   <Edit />
//                 </IconButton>
//                 <IconButton onClick={() => handleDelete(promo._id)}>
//                   <Delete />
//                 </IconButton>
//               </Grid>
//             </Grid>
//           </Box>
//         ))
//       )}

//       <Dialog
//         open={!!editingPromotion}
//         onClose={() => setEditingPromotion(null)}
//       >
//         <DialogTitle>Editar promoción</DialogTitle>
//         <form onSubmit={handleSubmit(handleEditSubmit)}>
//           <DialogContent>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <Controller
//                   name="title"
//                   control={control}
//                   defaultValue=""
//                   render={({ field }) => (
//                     <TextField label="Título" fullWidth required {...field} />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="startDate"
//                   control={control}
//                   defaultValue=""
//                   render={({ field }) => (
//                     <TextField
//                       label="Fecha de inicio"
//                       type="date"
//                       fullWidth
//                       InputLabelProps={{ shrink: true }}
//                       required
//                       {...field}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="endDate"
//                   control={control}
//                   defaultValue=""
//                   render={({ field }) => (
//                     <TextField
//                       label="Fecha de fin"
//                       type="date"
//                       fullWidth
//                       InputLabelProps={{ shrink: true }}
//                       required
//                       {...field}
//                     />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setEditingPromotion(null)}>Cancelar</Button>
//             <Button type="submit" variant="contained">
//               Guardar cambios
//             </Button>
//           </DialogActions>
//         </form>
//       </Dialog>
//     </Box>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import useBranchStore from "../store/useBranchStore";
import { useForm, Controller } from "react-hook-form";
import usePromoStore from "../store/usePromoStore";

export default function PromotionList() {
  const { selectedBranchId } = useBranchStore();
  const [editingPromotion, setEditingPromotion] = useState(null);
  const { control, handleSubmit, reset } = useForm();

  // Store global
  const allPromotions = usePromoStore((s) => s.allPromotions);
  const getAllPromotions = usePromoStore((s) => s.getAllPromotions);
  const getExpiredPromotions = usePromoStore((s) => s.getExpiredPromotions);

  useEffect(() => {
    getAllPromotions(selectedBranchId);
  }, [selectedBranchId]);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro que querés eliminar esta promoción?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/promotions/${id}`);
        getAllPromotions(selectedBranchId);
        getExpiredPromotions(selectedBranchId);
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
      getAllPromotions(selectedBranchId);
      getExpiredPromotions(selectedBranchId);
    } catch (err) {
      console.error("Error al actualizar promoción:", err);
    }
  };

  // --- Ordenar por fecha de fin (más próximas primero) ---
  const sortedPromos = [...allPromotions].sort((a, b) => {
    const aEnd = (a.endDate || "").slice(0, 10);
    const bEnd = (b.endDate || "").slice(0, 10);
    return aEnd.localeCompare(bEnd);
  });

  // Fecha "hoy" en ISO (UTC) para comparar solo YYYY-MM-DD
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Promociones de la sucursal
      </Typography>

      {sortedPromos.length === 0 ? (
        <Typography variant="body2">No hay promociones cargadas.</Typography>
      ) : (
        sortedPromos.map((promo) => {
          const endISO = (promo.endDate || "").slice(0, 10);
          const isExpired = endISO < todayISO;

          return (
            <Box
              key={promo._id}
              sx={{
                border: "1px solid",
                borderColor: isExpired ? "error.main" : "#ddd",
                borderRadius: 2,
                p: 2,
                mb: 2,
                backgroundColor: isExpired ? "rgba(244,67,54,0.08)" : "#f9f9f9",
              }}
            >
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm={8}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: isExpired ? "error.main" : "inherit", fontWeight: 600 }}
                  >
                    {promo.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isExpired ? "error.main" : "inherit" }}
                  >
                    {promo.startDate.slice(0, 10)} a {endISO}
                    {isExpired ? " • VENCIDA" : ""}
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
          );
        })
      )}

      <Dialog
        open={!!editingPromotion}
        onClose={() => setEditingPromotion(null)}
      >
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
