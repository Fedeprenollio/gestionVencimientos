// import { useState } from 'react';

// export default function ExpiringProductFilter({ onFilter }) {
//   const [from, setFrom] = useState('');
//   const [months, setMonths] = useState(6);
//   const [branch, setBranch] = useState('');
//   const [type, setType] = useState('');

//   const applyFilter = () => {
//     onFilter({ from, months, branch, type });
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
//       <h3>Filtrar productos por vencimiento</h3>

//       <div>
//         <label>Desde (fecha):</label>
//         <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
//       </div>

//       <div>
//         <label>Meses a futuro:</label>
//         <input type="number" value={months} onChange={e => setMonths(e.target.value)} min={1} />
//       </div>

//       <div>
//         <label>Sucursal:</label>
//         <select value={branch} onChange={e => setBranch(e.target.value)}>
//           <option value="">Todas</option>
//           <option value="sucursal1">Sucursal 1</option>
//           <option value="sucursal2">Sucursal 2</option>
//           <option value="sucursal3">Sucursal 3</option>
//         </select>
//       </div>

//       <div>
//         <label>Tipo:</label>
//         <select value={type} onChange={e => setType(e.target.value)}>
//           <option value="">Todos</option>
//           <option value="medicamento">Medicamento</option>
//           <option value="perfumeria">Perfumería</option>
//         </select>
//       </div>

//       <button onClick={applyFilter}>Aplicar filtro</button>
//     </div>
//   );
// }

import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';

export default function ExpiringProductFilter({ onFilter }) {
  const [from, setFrom] = useState('');
  const [months, setMonths] = useState(6);
  const [branch, setBranch] = useState('');
  const [type, setType] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  const applyFilter = () => {
    onFilter({
      from,
      months,
      branch,
      type,
      createdFrom,
      createdTo,
    });
  };

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 3,
        mb: 3,
        boxShadow: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Filtrar productos por vencimiento
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
  {/* Vencimiento desde */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      label="Desde (vencimiento)"
      type="date"
      value={from}
      onChange={(e) => setFrom(e.target.value)}
      fullWidth
      InputLabelProps={{ shrink: true }}
      variant="outlined"
    />
  </Grid>

  {/* Meses a futuro */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      label="Meses a futuro"
      type="number"
      value={months}
      onChange={(e) => setMonths(Number(e.target.value))}
      fullWidth
      inputProps={{ min: 1 }}
      variant="outlined"
    />
  </Grid>

  {/* Sucursal */}
  <Grid item xs={12} sm={6} md={4}>
    <FormControl fullWidth  sx={{  minWidth: 240 }} variant="outlined">
      <InputLabel id="branch-label">Sucursal</InputLabel>
      <Select
        labelId="branch-label"
        id="branch"
        value={branch}
        label="Sucursal"
        onChange={(e) => setBranch(e.target.value)}
      >
        <MenuItem value="">Todas</MenuItem>
        <MenuItem value="sucursal1">Sucursal 1</MenuItem>
        <MenuItem value="sucursal2">Sucursal 2</MenuItem>
        <MenuItem value="sucursal3">Sucursal 3</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Tipo */}
  <Grid item xs={12} sm={6} md={4}>
    <FormControl  fullWidth  sx={{  minWidth: 240 }} variant="outlined">
      <InputLabel id="type-label">Tipo</InputLabel>
      <Select
        labelId="type-label"
        id="type"
        value={type}
        label="Tipo"
        onChange={(e) => setType(e.target.value)}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="medicamento">Medicamento</MenuItem>
        <MenuItem value="perfumeria">Perfumería</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Creado desde */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      label="Creado desde"
      type="date"
      value={createdFrom}
      onChange={(e) => setCreatedFrom(e.target.value)}
      fullWidth
      InputLabelProps={{ shrink: true }}
      variant="outlined"
    />
  </Grid>

  {/* Creado hasta */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      label="Creado hasta"
      type="date"
      value={createdTo}
      onChange={(e) => setCreatedTo(e.target.value)}
      fullWidth
      InputLabelProps={{ shrink: true }}
      variant="outlined"
    />
  </Grid>

  {/* Botón aplicar */}
  <Grid item xs={12}>
    <Button
      variant="contained"
      onClick={applyFilter}
      fullWidth
    >
      Aplicar filtro
    </Button>
  </Grid>
</Grid>

    </Box>
  );
}
