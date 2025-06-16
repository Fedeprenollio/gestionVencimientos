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


// src/components/QuaggaScanner.jsx
import { useEffect, useRef } from "react";
import Quagga from "quagga";

export default function BarcodeScanner({ onDetected, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: containerRef.current,
          constraints: { facingMode: "environment" },
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"],
        },
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          onClose();
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      onDetected(data.codeResult.code);
      Quagga.stop();
      onClose();
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      {/* Quagga inyecta el <video> y <canvas> aquí */}
      <button onClick={() => { Quagga.stop(); onClose(); }}>Cancelar</button>
    </div>
  );
}
