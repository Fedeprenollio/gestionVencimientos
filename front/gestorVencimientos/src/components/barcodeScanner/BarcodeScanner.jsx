// import { useEffect, useRef, useState } from "react";
// import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
// import { CircularProgress, Typography, Box, Button, IconButton } from "@mui/material";
// import CloseIcon from '@mui/icons-material/Close';

// export default function BarcodeScanner({ onDetected, onClose }) {
//   const scannerRef = useRef(null);
//   const [loading, setLoading] = useState(true);

//   const stopScanner = () => {
//     if (
//       scannerRef.current &&
//       scannerRef.current.getState &&
//       scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
//     ) {
//       scannerRef.current
//         .stop()
//         .then(() => {
//           onClose?.();
//         })
//         .catch(() => onClose?.());
//     } else {
//       onClose?.();
//     }
//   };

//   useEffect(() => {
//     const scanner = new Html5Qrcode("barcode-scanner");
//     scannerRef.current = scanner;

//     scanner
//       .start(
//         { facingMode: "environment" },
//         { fps: 10, qrbox: 250 },
//         (decodedText) => {
//           onDetected(decodedText);
//           stopScanner();
//         },
//         () => {}
//       )
//       .then(() => setLoading(false))
//       .catch((err) => {
//         console.error("Error iniciando escáner", err);
//         alert("No se pudo acceder a la cámara. Verifica permisos o dispositivo.");
//         setLoading(false);
//         onClose?.();
//       });

//     return () => {
//       stopScanner();
//     };
//   }, []);

//   return (
//     <Box
//       sx={{
//         position: "relative",
//         textAlign: "center",
//         maxWidth: 400,
//         margin: "auto",
//       }}
//     >
//       {/* Botón de cerrar */}
//       <IconButton
//         onClick={stopScanner}
//         sx={{ position: "absolute", top: 4, right: 4, zIndex: 2 }}
//         aria-label="Cerrar escáner"
//       >
//         <CloseIcon />
//       </IconButton>

//       {/* Cargando */}
//       {loading && (
//         <Box sx={{ mb: 2 }}>
//           <CircularProgress size={24} />
//           <Typography variant="body2">Abriendo cámara...</Typography>
//         </Box>
//       )}

//       {/* Contenedor del escáner */}
//       <div
//         id="barcode-scanner"
//         style={{
//           border: "1px solid #ccc",
//           borderRadius: 8,
//           overflow: "hidden",
//         }}
//       />

//       {/* Botón Cancelar visible solo si ya cargó */}
//       {!loading && (
//         <Button onClick={stopScanner} fullWidth sx={{ mt: 2 }}>
//           Cancelar
//         </Button>
//       )}
//     </Box>
//   );
// }


import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  // Enumerar cámaras disponibles
  useEffect(() => {
    (async () => {
      try {
        const available = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = available.filter((d) => d.kind === "videoinput");
        setDevices(videoInputs);
        if (videoInputs.length > 0) {
          setDeviceId(videoInputs[0].deviceId);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error enumerando dispositivos:", e);
        setLoading(false);
      }
    })();
  }, []);

  // Configurar el hook con el deviceId seleccionado
  const { ref: videoRef, error: scanError, result, stop } = useZxing({
    onResult: (res) => {
      const code = res.getText();
      setLastResult(code);
      onDetected(code);
    },
    timeBetweenDecodingAttempts: 200,
    videoConstraints: deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: "environment" },
  });

  // Cuando cambia deviceId, resetea
  useEffect(() => {
    if (!loading && stop) stop();
  }, [deviceId, stop, loading]);

  // Cleanup
  useEffect(() => () => stop?.(), [stop]);

  if (scanError) {
    return (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo acceder a la cámara o no hay cámaras disponibles.
        </Alert>
        <Button variant="contained" onClick={onClose} fullWidth>
          Cerrar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: "center", mb: 2 }}>
      {loading && (
        <Box sx={{ mb: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2">Buscando cámaras...</Typography>
        </Box>
      )}

      {!loading && devices.length > 1 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Cámara</InputLabel>
          <Select
            value={deviceId}
            label="Cámara"
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <MenuItem key={d.deviceId} value={d.deviceId}>
                {d.label || d.deviceId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc" }}
        muted
        playsInline
        autoPlay
      />

      {!loading && lastResult && (
        <Typography sx={{ mt: 1 }}>
          Último resultado: <strong>{lastResult}</strong>
        </Typography>
      )}

      {!loading && (
        <Button
          onClick={() => {
            stop?.();
            onClose();
          }}
          fullWidth
          sx={{ mt: 2 }}
        >
          Cancelar
        </Button>
      )}
    </Box>
  );
}
