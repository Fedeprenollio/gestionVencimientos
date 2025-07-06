import React, { useState } from "react";
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
import dayjs from "dayjs";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode"; // o react-zxing si preferís

const MonthExpirationScanner = ({ branches }) => {
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [branch, setBranch] = useState("");
  const [lots, setLots] = useState([]);
  const [foundBarcodes, setFoundBarcodes] = useState([]);
    const [codigoLeido,  setCodigoLeido] = useState([]);

  const handleLoadLots = async () => {
    try {
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/lots/expiring",
        {
          params: { from, months: 1, branch },
        }
      );
      console.log("RES", res.data);
      setLots(res.data);
      setFoundBarcodes([]);
    } catch (err) {
      console.error("Error cargando lotes:", err);
    }
  };

  const handleScan = (barcode) => {
    if (!foundBarcodes.includes(barcode)) {
      setFoundBarcodes((prev) => [...prev, barcode]);
    }
  };

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
        setCodigoLeido(decodedText)
        scanner.clear();
        startScanner(); // reiniciar escáner
      },
      (error) => {
        // fallbacks opcionales
      }
    );
  };

  const missingLots = lots?.filter(
    (lot) => !foundBarcodes?.includes(lot.productId?.barcode)
  );

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Productos a vencer en {dayjs(`${year}-${month}-01`).format("MMMM YYYY")}
      </Typography>
codigo leido: {codigoLeido}!!!
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={3}>
          <TextField
            label="Año"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Mes"
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Seleccionar sucursal</MenuItem>
            {branches?.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" onClick={handleLoadLots} fullWidth>
            Buscar
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {lots.length > 0 && (
        <>
          <Button variant="outlined" onClick={startScanner}>
            Iniciar escáner
          </Button>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">
                  Encontrados ({foundBarcodes.length})
                </Typography>
                <List dense>
                  {lots
                    ?.filter((lot) =>
                      foundBarcodes.includes(lot.productId.barcode)
                    )
                    .map((lot, idx) => (
                      <ListItem key={idx}>
                        ✅ {lot.productId.name} ({lot.productId.barcode}) -{" "}
                        {dayjs(lot.expirationDate).format("DD/MM/YYYY")}
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

          <Box mt={4} id="reader" />
        </>
      )}
    </Box>
  );
};

export default MonthExpirationScanner;
