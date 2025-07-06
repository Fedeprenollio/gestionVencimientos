import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { Html5QrcodeScanner } from "html5-qrcode";
import dayjs from "dayjs";

import * as XLSX from "xlsx";

const exportToExcel = ({
  scannedReturns = [],
  expiringLots = [],
  returnList = {},
}) => {
  // 1. Escaneos
  const scannedSheet = scannedReturns.map((item) => {
    const lot = expiringLots.find((l) => l._id === item.loteId);
    const product = lot?.productId;

    return {
      Producto: product?.name || "Desconocido",
      "Código de barra": product?.barcode || item.barcode,
      Cantidad: item.quantity,
      Vencimiento: lot?.expirationDate
        ? new Date(lot.expirationDate).toLocaleDateString()
        : "-",
    };
  });

  // 2. Lotes originales + devueltos
  const lotsSheet = expiringLots.map((lot) => {
    const devoluciones = scannedReturns.filter((r) => r.loteId === lot._id);
    const devueltas = devoluciones.reduce((acc, r) => acc + r.quantity, 0);

    return {
      Producto: lot.productId?.name || "Desconocido",
      "Código de barra": lot.productId?.barcode || "-",
      "Cantidad original": lot.quantity,
      "Cantidad devuelta": devueltas,
      Restante: Math.max(0, lot.quantity - devueltas),
      Vencimiento: new Date(lot.expirationDate).toLocaleDateString(),
    };
  });

  // 3. Combinado (por cada devolución, mostrar detalles completos)
  const combinedSheet = scannedReturns.map((r) => {
    const lot = expiringLots.find((l) => l._id === r.loteId);
    const product = lot?.productId;

    return {
      Producto: product?.name || "Desconocido",
      "Código de barra": product?.barcode || r.barcode,
      "Cantidad devuelta": r.quantity,
      "Cantidad original del lote": lot?.quantity || "-",
      "Cantidad restante": lot ? Math.max(0, lot.quantity - r.quantity) : "-",
      Vencimiento: lot?.expirationDate
        ? new Date(lot.expirationDate).toLocaleDateString()
        : "-",
    };
  });

  // Crear workbook
  const wb = XLSX.utils.book_new();

  const scannedWs = XLSX.utils.json_to_sheet(scannedSheet);
  const lotsWs = XLSX.utils.json_to_sheet(lotsSheet);
  const combinedWs = XLSX.utils.json_to_sheet(combinedSheet);

  XLSX.utils.book_append_sheet(wb, scannedWs, "Escaneos");
  XLSX.utils.book_append_sheet(wb, lotsWs, "Lotes originales");
  XLSX.utils.book_append_sheet(wb, combinedWs, "Combinado");

  const fileName = `Devolucion_${returnList.branch || "sucursal"}_${
    returnList.month
  }_${returnList.year}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

const fetchReturnLists = async ({ branch, month, year }) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-lists`, {
    params: { branch, month, year },
  });
  console.log("RES_DATA:", res.data);
  return res.data;
};

const fetchExpiringLots = async ({ branch, month, year }) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/lots/expiring`, {
    params: { branch, month, year },
  });
  return res.data;
};

const createReturnList = async ({ branch, month, year }) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/return-lists`,
    { branch, month, year },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return res.data;
};

const addReturnsToList = async ({ id, returns }) => {
  const res = await axios.patch(
    `${import.meta.env.VITE_API_URL}/return-lists/${id}/returns`,
    { returns },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return res.data;
};

export default function ReturnListManager({ branches }) {
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      branch: "",
      year: dayjs().year(),
      month: dayjs().month() + 1,
    },
  });

  const [returnListId, setReturnListId] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  // Ahora scannedReturns guardará objetos con loteId además de barcode y quantity
  const [scannedReturns, setScannedReturns] = useState([]);
  const [originalLots, setOriginalLots] = useState([]);
const [originalScanned, setOriginalScanned] = useState([]);

useEffect(() => {
  if (scannedReturns.length > 0) {
    setOriginalScanned(scannedReturns);
  }
}, [scannedReturns]);


  const values = watch();

  //   const { data: returnLists = [] } = useQuery({
  //     queryKey: ["returnLists", values],
  //     queryFn: () => fetchReturnLists(values),
  //     enabled: !!values.branch,
  //   });

  const { data: expiringLots = [] } = useQuery({
    queryKey: ["expiringLots", values],
    queryFn: () => fetchExpiringLots(values),
    enabled: !!values.branch,
  });
  // Query para traer listas según filtros
  const { data: returnLists = [] } = useQuery({
    queryKey: ["returnLists", values],
    queryFn: () => fetchReturnLists(values),
    enabled: !!values.branch && !!values.month && !!values.year,
  });
  console.log("Valores actuales:", values);

  const mutationCreate = useMutation({ mutationFn: createReturnList });
  const mutationAddReturns = useMutation({ mutationFn: addReturnsToList });

  const onSelectReturnList = (id) => {
    setReturnListId(id);
    setScannedReturns([]);
    setScannerStarted(false); // Para reiniciar el escáner con la nueva lista
  };

  const onCreateList = async () => {
    try {
      const res = await mutationCreate.mutateAsync(values);
      setReturnListId(res._id);
    } catch (err) {
      console.error("Error creando lista:", err);
    }
  };

  // Para agregar escaneo manual o por scanner, necesitamos encontrar loteId en expiringLots
  const addReturnByBarcode = (barcode, qty) => {
    // Buscar el primer lote que tenga ese barcode y qty restante > 0
    const lot = expiringLots.find(
      (l) =>
        l.productId.barcode === barcode &&
        l.quantity - getReturnedQuantityForLot(l._id) > 0
    );
    if (!lot) {
      alert("No se encontró lote disponible para ese código");
      return;
    }

    setScannedReturns((prev) => [
      ...prev,
      { barcode, quantity: qty, loteId: lot._id },
    ]);
  };

  // Suma cantidad devuelta para un loteId
  const getReturnedQuantityForLot = (loteId) =>
    scannedReturns
      .filter((r) => r.loteId === loteId)
      .reduce((acc, r) => acc + r.quantity, 0);

  const handleManualScan = (e) => {
    if (e.key === "Enter") {
      const code = manualCode.trim();
      if (code) {
        addReturnByBarcode(code, Number(quantity) || 1);
        setManualCode("");
        setQuantity(1);
      }
    }
  };

  const removeCode = (index) => {
    setScannedReturns((prev) => prev.filter((_, i) => i !== index));
  };
  useEffect(() => {
  if (expiringLots.length > 0) {
    setOriginalLots(expiringLots); // copia los lotes como estaban
  }
}, [expiringLots]);


  useEffect(() => {
    if (returnListId && !scannerStarted) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(
        (decodedText) => {
          addReturnByBarcode(decodedText, Number(quantity) || 1);
          setManualCode("");
          setQuantity(1);
          scanner.clear();
          setTimeout(() => {
            scanner.render(
              (decodedText) => addReturnByBarcode(decodedText, 1),
              () => {}
            );
          }, 500);
        },
        (error) => {}
      );
      setScannerStarted(true);
    }
  }, [returnListId, scannerStarted, quantity, expiringLots]);


const onAddReturns = async () => {
  try {
    await mutationAddReturns.mutateAsync({
      id: returnListId,
      returns: scannedReturns,
    });
    alert("Lotes añadidos exitosamente");
    setScannedReturns([]);
  } catch (err) {
    console.error("Error agregando lotes:", err);
  }
};


//   const onAddReturns = async () => {
//     try {
//       await mutationAddReturns.mutateAsync({
//         id: returnListId,
//         returns: scannedReturns,
//       });
//       alert("Lotes añadidos exitosamente");
//       setScannedReturns([]);
//     } catch (err) {
//       console.error("Error agregando lotes:", err);
//     }
//   };

  return (
    <Box p={3}>
      <Typography variant="h5">Gestión de Devoluciones</Typography>

      <form onSubmit={handleSubmit(() => {})}>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={4}>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Año" type="number" />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Mes" type="number" />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth displayEmpty>
                  <MenuItem value="">Seleccionar sucursal</MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>
        </Grid>
      </form>

      {/* Listado de listas */}
      {returnLists.length > 0 && (
        <>
          <Typography>Listas disponibles:</Typography>
          {returnLists.map((list) => (
            <Button key={list._id} onClick={() => onSelectReturnList(list._id)}>
              Lista #{list._id.slice(-5)} - {list.createdBy?.name}
            </Button>
          ))}
        </>
      )}

      <Button variant="contained" onClick={onCreateList} sx={{ mt: 2 }}>
        Crear nueva devolución
      </Button>

      {expiringLots.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Lotes próximos a vencer</Typography>

          {expiringLots.map((lot) => {
            const returnedQty = getReturnedQuantityForLot(lot._id);
            const remaining = Math.max(0, lot.quantity - returnedQty);

            // Obtener devoluciones para este lote para mostrar debajo
            const returnsForLot = scannedReturns.filter(
              (r) => r.loteId === lot._id
            );

            return (
              <Paper
                key={lot._id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: remaining > 0 ? "lightgreen" : "lightgray",
                }}
              >
                <Typography fontWeight="bold">
                  {lot.productId.name} - {lot.productId.barcode}
                </Typography>
                <Typography>
                  {remaining}u disponibles - Vence:{" "}
                  {dayjs(lot.expirationDate).format("DD/MM/YYYY")}
                </Typography>

                {returnsForLot.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: "lightcoral" }}>
                    <Typography variant="subtitle2">Devoluciones:</Typography>
                    {returnsForLot.map((r, i) => (
                      <Typography key={i}>
                        {r.quantity} unidad(es) devueltas
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {returnListId && (
        <>
          <Typography variant="subtitle1" mt={4}>
            Escaneá productos para devolver:
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={3}>
              <TextField
                label="Cantidad"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="Escaneá o escribí código"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={handleManualScan}
              />
            </Grid>
          </Grid>

          <Box id="reader" sx={{ mt: 2 }} />

          {scannedReturns.length > 0 && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6">
                Devoluciones escaneadas ({scannedReturns.length})
              </Typography>
              <List dense>
                {scannedReturns.map((item, idx) => {
                  // Buscar lote en expiringLots
                  const lote = expiringLots.find((l) => l._id === item.loteId);
                  const nombre = lote?.productId?.name || "Desconocido";

                  return (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeCode(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      {nombre} - {item.barcode} - {item.quantity} unidad(es)
                    </ListItem>
                  );
                })}
              </List>
              <Button
                variant="contained"
                color="success"
                onClick={onAddReturns}
                fullWidth
                sx={{ mt: 2 }}
              >
                Confirmar devolución
              </Button>
            </Paper>
          )}
        </>
      )}
     <Button onClick={() =>
  exportToExcel({
    scannedReturns: originalScanned,
    expiringLots: originalLots,
    returnList: {
      branch: values.branch,
      month: values.month,
      year: values.year,
      createdBy: returnLists.find(r => r._id === returnListId)?.createdBy,
    }
  })
}>
  Exportar a Excel
</Button>

    </Box>
  );
}
