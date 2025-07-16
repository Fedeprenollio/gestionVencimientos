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
      Lote: lot?.batchNumber || "-", // <-- agregado
      "N° Serie": lot?.serialNumber || "-", // <-- agregado
    };
  });

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
      Lote: lot.batchNumber || "-", // <-- agregado
      "N° Serie": lot.serialNumber || "-", // <-- agregado
    };
  });

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
      Lote: lot?.batchNumber || "-", // <-- agregado
      "N° Serie": lot?.serialNumber || "-", // <-- agregado
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(scannedSheet),
    "Escaneos"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(lotsSheet),
    "Lotes originales"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(combinedSheet),
    "Combinado"
  );

  const fileName = `Devolucion_${returnList.name || returnList.branch}_${
    returnList.month
  }_${returnList.year}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

const fetchReturnLists = async ({ branch, month, year }) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-lists`, {
    params: { branch, month, year },
  });
  return res.data;
};

const removeScannedReturn = async ({ id, scannedReturnIndex }) => {
  const res = await axios.patch(
    `${import.meta.env.VITE_API_URL}/return-lists/${id}/remove-scanned-return`,
    { scannedReturnIndex },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return res.data; // ahora devuelve { scannedReturns, lots }
};

const fetchExpiringLots = async ({ branch, month, year }) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/lots/expiring`, {
    params: { branch, month, year },
  });
  return res.data;
};

const createReturnList = async ({ branch, month, year, name }) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/return-lists`,
    { branch, month, year, name },
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

const fetchReturnListById = async (id) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/return-lists/${id}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return res.data;
};
const fetchReturnsSummary = async ({ branch, month, year }) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/return-lists/summary`,
    {
      params: { branch, month, year },
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
      name: "",
    },
  });

  const [returnListId, setReturnListId] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [scannedReturns, setScannedReturns] = useState([]);
  const [originalLots, setOriginalLots] = useState([]);
  const [originalScanned, setOriginalScanned] = useState([]);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [pendingScan, setPendingScan] = useState(null); // para guardar el lote escaneado que espera datos
  const [inputBatchNumber, setInputBatchNumber] = useState("");
  const [inputSerialNumber, setInputSerialNumber] = useState("");

  const values = watch();

  useEffect(() => {
  // Limpiar datos viejos al cambiar filtros para evitar mostrar info de meses anteriores
  setOriginalLots([]);
  setOriginalScanned([]);
  setScannedReturns([]);
  setReturnListId(null); // Opcional: resetear lista seleccionada
  setScannerStarted(false);
}, [values.branch, values.month, values.year]);



  const { data: returnSummary = [] } = useQuery({
    queryKey: ["returnSummary", values],
    queryFn: () => fetchReturnsSummary(values),
    enabled: !!values.branch && !!values.month && !!values.year,
  });

  const { data: expiringLots = [] } = useQuery({
    queryKey: ["expiringLots", values],
    queryFn: () => fetchExpiringLots(values),
    enabled: !!values.branch,
  });

  const { data: returnLists = [] } = useQuery({
    queryKey: ["returnLists", values],
    queryFn: () => fetchReturnLists(values),
    enabled: !!values.branch && !!values.month && !!values.year,
  });

  const mutationCreate = useMutation({ mutationFn: createReturnList });
  const mutationAddReturns = useMutation({ mutationFn: addReturnsToList });

  useEffect(() => {
    if (expiringLots.length > 0) setOriginalLots(expiringLots);
  }, [expiringLots]);

  // useEffect(() => {
  //   if (scannedReturns.length > 0) setOriginalScanned(scannedReturns);
  // }, [scannedReturns]);

  const onCreateList = async () => {
    try {
      const res = await mutationCreate.mutateAsync(values);
      setReturnListId(res._id);
    } catch (err) {
      console.error("Error creando lista:", err);
    }
  };

  const onSelectReturnList = async (id) => {
    try {
      const data = await fetchReturnListById(id);
      setReturnListId(id);
      setScannedReturns(data.scannedReturns || []);
      setOriginalScanned(data.scannedReturns || []);
      setOriginalLots(expiringLots); // Mantené los productos originales del mes/sucursal
      setScannerStarted(false);
    } catch (err) {
      console.error("Error obteniendo la lista:", err);
    }
  };

  const getReturnedQuantityForLot = (loteId) =>
    scannedReturns
      .filter((r) => r.loteId === loteId)
      .reduce((acc, r) => acc + r.quantity, 0);

  // const addReturnByBarcode = (barcode, qty) => {
  //   const allLots = [...originalLots, ...expiringLots];
  //   const lot = allLots.find(
  //     (l) =>
  //       l.productId?.barcode === barcode &&
  //       l.quantity - getReturnedQuantityForLot(l._id) > 0
  //   );
  //   if (!lot) {
  //     alert("No se encontró lote disponible para ese código");
  //     return;
  //   }
  //   setScannedReturns((prev) => [
  //     ...prev,
  //     { barcode, quantity: qty, loteId: lot._id },
  //   ]);
  // };

  const addReturnByBarcode = (barcode, qty) => {
    const allLots = [...originalLots, ...expiringLots];
    const lot = allLots.find(
      (l) =>
        l.productId?.barcode === barcode &&
        l.quantity - getReturnedQuantityForLot(l._id) > 0
    );

    if (!lot) {
      alert("No se encontró lote disponible para ese código");
      return;
    }

    // Si el lote tiene número de serie o lote, pedimos al usuario que lo ingrese antes de confirmar
    if (lot.batchNumber || lot.serialNumber) {
      setPendingScan({ lot, barcode, quantity: qty });
      return;
    }

    // Si no requiere lote/serie, se registra directamente
    setScannedReturns((prev) => [
      ...prev,
      { barcode, quantity: qty, loteId: lot._id },
    ]);
  };

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

const removeCode = async (index) => {
  if (!returnListId) {
    // No hay lista activa, solo estado local
    setScannedReturns((prev) => prev.filter((_, i) => i !== index));
    return;
  }

  // Determinar si el escaneo a eliminar está confirmado o es nuevo
  const itemToRemove = scannedReturns[index];
  const isConfirmed = originalScanned.some(
    (osr) =>
      String(osr.loteId._id || osr.loteId) === String(itemToRemove.loteId._id || itemToRemove.loteId) &&
      osr.quantity === itemToRemove.quantity &&
      osr.barcode === itemToRemove.barcode
  );

  if (!isConfirmed) {
    // Es un escaneo nuevo sin confirmar, elimino solo localmente
    setScannedReturns((prev) => prev.filter((_, i) => i !== index));
    return;
  }

  // Si es confirmado, confirmo que quiero eliminarlo
  const confirmDelete = window.confirm("¿Estás seguro de eliminar este escaneo confirmado?");
  if (!confirmDelete) return;

  try {
    const data = await removeScannedReturn({
      id: returnListId,
      scannedReturnIndex: index,
    });

    setScannedReturns(data.scannedReturns || []);
    setOriginalLots(data.lots || []);
  } catch (err) {
    console.error("Error eliminando escaneo:", err);
    alert("Error eliminando el escaneo. Intentá de nuevo.");
  }
};


  useEffect(() => {
    if (returnListId && !scannerStarted) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

      let lastScannedCode = null;
      let lastScanTime = 0;

      scanner.render(
        (decodedText) => {
          const now = Date.now();

          // Evitar escaneos repetidos en menos de 3 segundos
          if (decodedText === lastScannedCode && now - lastScanTime < 3000) {
            return;
          }

          lastScannedCode = decodedText;
          lastScanTime = now;

          addReturnByBarcode(decodedText, Number(quantity) || 1);
          setManualCode("");
          setQuantity(1);
        },
        (error) => {
          // podés loguearlo si querés
          // console.warn("QR error", error);
        }
      );

      setScannerStarted(true);
    }
  }, [returnListId, scannerStarted, quantity, expiringLots]);

  const onAddReturns = async () => {
    try {
      // Filtrar escaneos nuevos (que aún no estaban confirmados antes)
      const newReturns = scannedReturns.filter((sr) => {
        return !originalScanned.some(
          (osr) =>
            String(osr.loteId._id || osr.loteId) ===
              String(sr.loteId._id || sr.loteId) &&
            osr.quantity === sr.quantity &&
            osr.barcode === sr.barcode
        );
      });

      if (newReturns.length === 0) {
        alert("No hay nuevos escaneos para confirmar.");
        return;
      }

      await mutationAddReturns.mutateAsync({
        id: returnListId,
        returns: newReturns,
      });

      alert("Lotes añadidos exitosamente");

      // Actualizar el estado completo con los datos más recientes del backend
      const data = await fetchReturnListById(returnListId);
      setScannedReturns(data.scannedReturns || []);
      setOriginalScanned(data.scannedReturns || []);
      setOriginalLots(data.lots || []);
    } catch (err) {
      console.error("Error agregando lotes:", err);
    }
  };

  
  const newCount = scannedReturns.filter(
  (sr) =>
    !originalScanned.some(
      (osr) =>
        String(osr.loteId._id || osr.loteId) === String(sr.loteId._id || sr.loteId) &&
        osr.quantity === sr.quantity &&
        osr.barcode === sr.barcode
    )
).length;
{
    console.log("🧪 newCount:", newCount);
  }
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

      {returnLists.length > 0 && (
        <>
          <Typography>Listas disponibles:</Typography>
          {returnLists.map((list) => (
            <Button key={list._id} onClick={() => onSelectReturnList(list._id)}>
              {list.name} - {list.createdBy?.name}
              {list.createdBy?.name || list.createdBy?.fullname}
            </Button>
          ))}
        </>
      )}
      <Grid item xs={12}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Nombre de la devolución" />
          )}
        />
      </Grid>

      <Button variant="contained" onClick={onCreateList} sx={{ mt: 2 }}>
        Crear nueva devolución
      </Button>

      {originalLots.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">
            Lotes próximos a vencer (EN GRIS PRODUCTOS YA DEVUELVOS, EN VERDE
            SIN DEVOLVER, EN ROJO PRODUCTOS CON UNIDADES PENDIENTES DE DEVOLVER)
          </Typography>
          {originalLots.map((lot) => {
            const returnedInThisList = scannedReturns
              .filter(
                (r) => String(r.loteId._id || r.loteId) === String(lot._id)
              )
              .reduce((acc, r) => acc + r.quantity, 0);

            const remainingInThisList = Math.max(
              0,
              lot.quantity - returnedInThisList
            );

            const totalReturned = originalScanned
              .filter(
                (r) => String(r.loteId._id || r.loteId) === String(lot._id)
              )
              .reduce((acc, r) => acc + r.quantity, 0);

            const quantityReturnedGlobal =
              returnSummary.find((s) => s.loteId === lot._id)
                ?.quantityReturned || 0;

            const remainingGlobal = Math.max(
              0,
              lot.quantity - quantityReturnedGlobal
            );

            const totalRemaining = Math.max(
              0,
              lot.quantity - quantityReturnedGlobal
            );

            const returnsForLot = scannedReturns.filter(
              (r) => String(r.loteId._id || r.loteId) === String(lot._id)
            );

            return (
              <Paper
                key={lot._id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor:
                    remainingGlobal === 0
                      ? "lightgray"
                      : remainingGlobal === lot.quantity
                      ? "lightgreen"
                      : "lightcoral",
                }}
              >
                <Typography fontWeight="bold">
                  {lot.productId?.name || "Sin nombre"} -{" "}
                  {lot.productId?.barcode || "Sin código"}
                </Typography>

                <Typography>
                  Unidades restantes <strong>en esta lista</strong>:{" "}
                  {remainingInThisList} u.
                </Typography>
                <Typography>
                  Unidades restantes <strong>totales</strong> (en todas las
                  listas): {totalRemaining} u.
                </Typography>

                <Typography>
                  Vence: {dayjs(lot.expirationDate).format("DD/MM/YYYY")}
                </Typography>
                {(lot.batchNumber || lot?.batchNumber ) && (
  <Typography variant="body2" color="text.secondary">
    Lote: {lot?.batchNumber || "-"} | N° Serie: {lot.serialNumber  || "-"}
  </Typography>
)}


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
          {pendingScan && (
            <Paper sx={{ mt: 2, p: 2, border: "2px dashed orange" }}>
              <Typography variant="subtitle1">
                Ingresar datos para producto:{" "}
                <strong>{pendingScan.lot?.productId?.name}</strong>
              </Typography>

              {pendingScan.lot?.batchNumber && (
                <TextField
                  label="Lote"
                  fullWidth
                  sx={{ my: 1 }}
                  value={inputBatchNumber}
                  onChange={(e) => setInputBatchNumber(e.target.value)}
                />
              )}

              {pendingScan.lot?.serialNumber && (
                <TextField
                  label="Número de Serie"
                  fullWidth
                  sx={{ my: 1 }}
                  value={inputSerialNumber}
                  onChange={(e) => setInputSerialNumber(e.target.value)}
                />
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    const { lot, barcode, quantity } = pendingScan;

                    // Validar si necesita lote o número de serie
                    if (lot.batchNumber && !inputBatchNumber.trim()) {
                      alert("Por favor ingresá el número de lote.");
                      return;
                    }

                    if (lot.serialNumber && !inputSerialNumber.trim()) {
                      alert("Por favor ingresá el número de serie.");
                      return;
                    }

                    setScannedReturns((prev) => [
                      ...prev,
                      {
                        barcode,
                        quantity,
                        loteId: lot._id,
                        batchNumber: inputBatchNumber.trim(),
                        serialNumber: inputSerialNumber.trim(),
                      },
                    ]);
                    setPendingScan(null);
                    setInputBatchNumber("");
                    setInputSerialNumber("");
                  }}
                >
                  Confirmar
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setPendingScan(null);
                    setInputBatchNumber("");
                    setInputSerialNumber("");
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Paper>
          )}

          {scannedReturns.length > 0 && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6">
                Devoluciones escaneadas ({scannedReturns.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nuevas devoluciones sin confirmar: {newCount}
              </Typography>

              <List dense>
                {scannedReturns.map((item, idx) => {
                  const lote = originalLots.find(
                    (l) =>
                      String(l._id) === String(item.loteId._id || item.loteId)
                  );

                  console.log("🔍 lote encontrado:", lote);

                  const nombre = lote?.productId?.name || "Desconocido";
                  console.log("🔍 buscando lote para:", item.loteId);
                  const isNew = !originalScanned.some(
                    (osr) =>
                      String(osr.loteId._id || osr.loteId) ===
                        String(item.loteId._id || item.loteId) &&
                      osr.quantity === item.quantity &&
                      osr.barcode === item.barcode
                  );

                  return (
                    <ListItem
                      key={idx}
                      sx={{
                        backgroundColor: isNew ? "#e3f2fd" : "transparent", // celeste claro si es nuevo
                        borderRadius: 1,
                        mb: 1,
                      }}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeCode(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <Box>
                        <Typography variant="body1">
                          {nombre} - {item.barcode} - {item.quantity} unidad(es)
                          {isNew && (
                            <Typography
                              component="span"
                              sx={{
                                ml: 1,
                                color: "white",
                                backgroundColor: "#42a5f5",
                                px: 1,
                                py: 0.2,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              NUEVO
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lote: {item.batchNumber || lote?.batchNumber || "-"} |
                          N° Serie:{" "}
                          {item.serialNumber || lote?.serialNumber || "-"}
                        </Typography>
                      </Box>
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

      <Button
        onClick={() =>
          exportToExcel({
            scannedReturns: originalScanned,
            expiringLots: originalLots,
            returnList: {
              branch: values.branch,
              month: values.month,
              year: values.year,
              createdBy: returnLists.find((r) => r._id === returnListId)
                ?.createdBy,
            },
          })
        }
      >
        Exportar a Excel
      </Button>
    </Box>
  );
}
