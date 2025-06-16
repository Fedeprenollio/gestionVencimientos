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
} from "@mui/material";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState("");

  // useZxing hook handles start/stop automatically
  const { ref: videoRef, error: scanError, result } = useZxing({
    onResult: (res) => {
      const code = res.getText();
      setLastResult(code);
      onDetected(code);
      onClose();
    },
    timeBetweenDecodingAttempts: 200,
    constraints: { video: { facingMode: "environment" } },
  });

  // Manage loading state when video element is ready
  useEffect(() => {
    if (videoRef.current) {
      setLoading(false);
    }
  }, [videoRef]);

  // Handle scan errors (e.g., no camera)
  if (scanError) {
    console.error("Scan error:", scanError);
    return (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se detectó una cámara. Por favor, ingrese el código manualmente.
        </Alert>
        <Button variant="contained" onClick={onClose} fullWidth>
          Cerrar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", textAlign: "center", mb: 2 }}>
      {loading && (
        <Box sx={{ mb: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2">Abriendo cámara...</Typography>
        </Box>
      )}

      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc" }}
        muted
        playsInline
      />

      {!loading && lastResult && (
        <Typography sx={{ mt: 1 }}>
          Último resultado: <strong>{lastResult}</strong>
        </Typography>
      )}

      {!loading && (
        <Button onClick={onClose} fullWidth sx={{ mt: 2 }}>
          Cancelar
        </Button>
      )}
    </Box>
  );
}
