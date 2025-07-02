import { useEffect, useState } from "react";
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
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

export default function ExpiringProductFilter({ onFilter }) {
  // const [from, setFrom] = useState("");
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState(getTodayDate());
  const [months, setMonths] = useState(6);
  const [branch, setBranch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [overstock, setOverstock] = useState("all");
  const [barcodes, setBarcodes] = useState("");
  const [branches, setBranches] = useState([]);

  const [createdBy, setCreatedBy] = useState("");
  const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
  //       setUsers(res.data);
  //     } catch (error) {
  //       console.error("Error al cargar usuarios:", error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  useEffect(() => {
    const fetchUsersAndBranches = async () => {
      try {
        const [usersRes, branchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users`),
          axios.get(`${import.meta.env.VITE_API_URL}/branches`),
        ]);

        setUsers(usersRes.data);
        setBranches(branchesRes.data);
      } catch (error) {
        console.error("Error al cargar usuarios o sucursales:", error);
      }
    };

    fetchUsersAndBranches();
  }, []);

  const applyFilter = () => {
    const filtros = {
      from,
      months,
      branch,
      overstock,
      barcodes,
    };

    if (createdFrom && dayjs(createdFrom).isValid()) {
      filtros.createdFrom = dayjs(createdFrom).format("YYYY-MM-DD");
    }

    if (createdTo && dayjs(createdTo).isValid()) {
      filtros.createdTo = dayjs(createdTo).format("YYYY-MM-DD");
    }

    if (createdBy) {
      filtros.createdBy = createdBy;
    }
    onFilter(filtros);
  };

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        mb: 3,
        boxShadow: 1,
        backgroundColor: "background.paper",
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
          <FormControl fullWidth sx={{ minWidth: 240 }} variant="outlined">
            <InputLabel id="branch-label">Sucursal</InputLabel>
            <Select
              labelId="branch-label"
              id="branch"
              value={branch}
              label="Sucursal"
              onChange={(e) => setBranch(e.target.value)}
            >
              {/* <MenuItem value="">Todas</MenuItem>
              <MenuItem value="sucursal1">Sucursal 1</MenuItem>
              <MenuItem value="sucursal2">Sucursal 2</MenuItem>
              <MenuItem value="sucursal3">Sucursal 3</MenuItem>
              <MenuItem value="9dejulio">9 de julio</MenuItem> */}
                <MenuItem value="">Todas</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Usuario que creó el lote */}
        {/* Usuario que creó el lote */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ minWidth: 240 }} variant="outlined">
            <InputLabel id="createdBy-label">Creado por</InputLabel>
            <Select
              labelId="createdBy-label"
              id="createdBy"
              value={createdBy}
              label="Creado por"
              onChange={(e) => setCreatedBy(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.fullname || user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Códigos de barra (lista separada por comas) */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Códigos de barra"
            value={barcodes}
            onChange={(e) => setBarcodes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: 7791, 1112223"
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* Sobrestock */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ minWidth: 240 }} variant="outlined">
            <InputLabel id="overstock-label">Sobrestock</InputLabel>
            <Select
              labelId="overstock-label"
              id="overstock"
              value={overstock}
              label="Sobrestock"
              onChange={(e) => setOverstock(e.target.value)}
            >
              <MenuItem value="all">Todos (incluye sobrestock)</MenuItem>
              <MenuItem value="false">
                Solo por vencer (excluye sobrestock)
              </MenuItem>
              <MenuItem value="only">Solo sobrestock</MenuItem>
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
          <Button variant="contained" onClick={applyFilter} fullWidth>
            Aplicar filtro
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
