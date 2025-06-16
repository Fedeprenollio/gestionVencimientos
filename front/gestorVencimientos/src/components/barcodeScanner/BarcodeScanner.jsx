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



import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box, CircularProgress, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error, controls) => {
          if (result) {
            onDetected(result.getText());
            // Detener usando el control que nos devolvió
            controls.stop().then(onClose).catch(onClose);
          }
          // guardamos controls para cerrar manualmente o en cleanup
          controlsRef.current = controls;
        }
      )
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("ZXing start error:", err);
        alert("No se pudo acceder a la cámara. Verifica permisos o dispositivo.");
        onClose();
      });

    return () => {
      // Solo detiene si existe controls
      const controls = controlsRef.current;
      if (controls && typeof controls.stop === 'function') {
        controls.stop().catch(() => {});
      }
    };
  }, [onDetected, onClose]);

  const handleClose = () => {
    const controls = controlsRef.current;
    if (controls && typeof controls.stop === 'function') {
      controls.stop().then(onClose).catch(onClose);
    } else {
      onClose();
    }
  };

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

      <IconButton
        onClick={handleClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
        aria-label="Cerrar escáner"
      >
        <CloseIcon />
      </IconButton>

      {!loading && (
        <Button onClick={handleClose} fullWidth sx={{ mt: 2 }}>
          Cancelar
        </Button>
      )}
    </Box>
  );
}

