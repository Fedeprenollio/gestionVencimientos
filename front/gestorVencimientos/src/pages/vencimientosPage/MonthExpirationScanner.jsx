import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { expirationScannerSchema } from "../../../utils/schemaYup/schemaYup";
import { Html5QrcodeScanner } from "html5-qrcode"; // o react-zxing si preferís

const fetchLots = async (params) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/lots/expiring`, {
    params,
  });
  return res.data;
};

const markAsReturned = async (lotId) => {
  await axios.patch(`${import.meta.env.VITE_API_URL}/lots/${lotId}/return`);
};

export default function MonthExpirationScanner({ branches }) {
  const [foundBarcodes, setFoundBarcodes] = useState([]);
  const [manualCode, setManualCode] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      month: dayjs().month() + 1,
      year: dayjs().year(),
      branch: "",
    },
    resolver: yupResolver(expirationScannerSchema),
  });

  const {
    data: lots = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["lots"],
    queryFn: () => fetchLots(watch()),
    enabled: false, // sólo se ejecuta al hacer submit
  });

  const mutation = useMutation({ mutationFn: markAsReturned });

  const onSubmit = () => refetch();

  const handleScan = (barcode) => {
    if (!foundBarcodes.includes(barcode)) {
      setFoundBarcodes((prev) => [...prev, barcode]);
    }
    setManualCode("");
  };

  const handleEnterScan = (e) => {
    if (e.key === "Enter") {
      handleScan(manualCode.trim());
    }
  };

  const missingLots = useMemo(
    () => lots.filter((lot) => !foundBarcodes.includes(lot.productId?.barcode)),
    [lots, foundBarcodes]
  );
  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
        scanner.clear(); // detenerlo tras 1 lectura
        setTimeout(startScanner, 200); // reiniciar
      },
      (error) => {
        // manejar errores si querés
      }
    );
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Productos a vencer
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Año"
                  fullWidth
                  error={!!errors.year}
                  helperText={errors.year?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mes"
                  fullWidth
                  error={!!errors.month}
                  helperText={errors.month?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  displayEmpty
                  fullWidth
                  error={!!errors.branch}
                >
                  <MenuItem value="">Seleccionar sucursal</MenuItem>
                  {branches?.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isFetching}
            >
              {isFetching ? "Cargando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Divider sx={{ my: 2 }} />

      {lots.length > 0 && (
        <>
        <Box display={"flex"}>

          <TextField
            label="Escáner"
            placeholder="Escaneá o escribí código"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={handleEnterScan}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box mt={4} id="reader" />

          <Button variant="outlined" onClick={startScanner}>
            Iniciar escáner con cámara
          </Button>
        </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">
                  Encontrados ({foundBarcodes.length})
                </Typography>
                <List dense>
                  {lots
                    .filter((lot) =>
                      foundBarcodes.includes(lot.productId.barcode)
                    )
                    .map((lot, idx) => (
                      <ListItem key={idx}>
                        ✅ {lot.productId.name} ({lot.productId.barcode}) -{" "}
                        {dayjs(lot.expirationDate).format("DD/MM/YYYY")}
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => mutation.mutate(lot._id)}
                        >
                          Marcar como devuelto
                        </Button>
                      </ListItem>
                    ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" color="error">
                  Faltantes ({missingLots.length})
                </Typography>
                <List dense>
                  {missingLots.map((lot, idx) => (
                    <ListItem key={idx}>
                      ❌ {lot.productId.name} ({lot.productId.barcode}) -{" "}
                      {dayjs(lot.expirationDate).format("DD/MM/YYYY")}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
