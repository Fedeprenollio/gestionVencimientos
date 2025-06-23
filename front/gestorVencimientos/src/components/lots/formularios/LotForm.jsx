import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function LotForm({
  productInfo,
  setProductInfo,
  productExists,
  quantity,
  setQuantity,
  expMonth,
  setExpMonth,
  expYear,
  setExpYear,
  branch,
  setBranch,
  overstock,
  setOverstock,
  onSubmit,
  onCancel, // opcional
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Si el producto no existe, permitir crear */}
      {productExists === false && (
        <>
          <TextField
            label="Nombre"
            value={productInfo.name}
            onChange={(e) =>
              setProductInfo((p) => ({ ...p, name: e.target.value }))
            }
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={productInfo.type}
              onChange={(e) =>
                setProductInfo((p) => ({ ...p, type: e.target.value }))
              }
              label="Tipo"
              required
            >
              <MenuItem value="medicamento">Medicamento</MenuItem>
              <MenuItem value="perfumeria">Perfumería</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {/* Expiración */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Mes</InputLabel>
            <Select
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              label="Mes"
              required
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, "0");
                return (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Año</InputLabel>
            <Select
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              label="Año"
              required
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Cantidad */}
      <TextField
        label="Cantidad"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* OverStock */}
      <FormControlLabel
        control={
          <Checkbox
            checked={overstock}
            onChange={(e) => setOverstock(e.target.checked)}
          />
        }
        label="Marcar como OverStock"
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" fullWidth>
        Guardar
      </Button>

      {onCancel && (
        <Button
          onClick={onCancel}
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          color="secondary"
        >
          Cancelar
        </Button>
      )}
    </Box>
  );
}



// import {
//   Box,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Grid,
//   Typography,
// } from "@mui/material";

// export default function LotForm({
//   productInfo,
//   setProductInfo,
//   productExists,
//   quantity,
//   setQuantity,
//   expMonth,
//   setExpMonth,
//   expYear,
//   setExpYear,
//   branch,
//   setBranch,
//   onSubmit,
//   onCancel, // opcional
// }) {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit();
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit}>
//       PROBANDO
//       {productExists === false && (
//         <>
//           <TextField
//             label="Nombre"
//             value={productInfo.name}
//             onChange={(e) =>
//               setProductInfo((p) => ({ ...p, name: e.target.value }))
//             }
//             fullWidth
//             required
//             sx={{ mb: 2 }}
//           />

//           <FormControl fullWidth sx={{ mb: 2 }}>
//             <InputLabel>Tipo</InputLabel>
//             <Select
//               value={productInfo.type}
//               onChange={(e) =>
//                 setProductInfo((p) => ({ ...p, type: e.target.value }))
//               }
//               label="Tipo"
//               required
//             >
//               <MenuItem value="medicamento">Medicamento</MenuItem>
//               <MenuItem value="perfumeria">Perfumería</MenuItem>
//             </Select>
//           </FormControl>
//         </>
//       )}

//       <Grid container spacing={2} sx={{ mb: 2 }}>
//         <Grid item xs={6}>
//           <FormControl fullWidth variant="outlined">
//             <InputLabel>Mes</InputLabel>
//             <Select
//               value={expMonth}
//               onChange={(e) => setExpMonth(e.target.value)}
//               label="Mes"
//               required
//             >
//               {Array.from({ length: 12 }, (_, i) => {
//                 const month = String(i + 1).padStart(2, "0");
//                 return (
//                   <MenuItem key={month} value={month}>
//                     {month}
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6}>
//           <FormControl fullWidth variant="outlined">
//             <InputLabel>Año</InputLabel>
//             <Select
//               value={expYear}
//               onChange={(e) => setExpYear(e.target.value)}
//               label="Año"
//               required
//             >
//               {Array.from({ length: 10 }, (_, i) => {
//                 const year = new Date().getFullYear() + i;
//                 return (
//                   <MenuItem key={year} value={year}>
//                     {year}
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//           </FormControl>
//         </Grid>
//       </Grid>

//       <TextField
//         label="Cantidad"
//         type="number"
//         value={quantity}
//         onChange={(e) => setQuantity(e.target.value)}
//         fullWidth
//         required
//         sx={{ mb: 2 }}
//       />

//       <Button type="submit" variant="contained" fullWidth>
//         Guardar
//       </Button>

//       {onCancel && (
//         <Button
//           onClick={onCancel}
//           variant="text"
//           fullWidth
//           sx={{ mt: 1 }}
//           color="secondary"
//         >
//           Cancelar
//         </Button>
//       )}
//     </Box>
//   );
// }
