// import { useEffect, useRef, useState } from "react";
// import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
// import {
//   Box,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   CircularProgress,
//   Alert,
// } from "@mui/material";

// const SCANNER_ID = "html5qr-reader";
// const CAMERA_KEY = "preferred-camera-id";

// export default function BarcodeScanner({ onDetected, onClose }) {
//   const scannerRef = useRef(null);
//   const [cameras, setCameras] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [scanningText, setScanningText] = useState("");
//   const [loadingCameras, setLoadingCameras] = useState(true);

//   // Obtener cámaras disponibles
//   useEffect(() => {
//     Html5Qrcode.getCameras()
//       .then((devices) => {
//         setCameras(devices);
//         const savedCamera = localStorage.getItem(CAMERA_KEY);
//         const defaultCam =
//           devices.find((d) => d.id === savedCamera) || devices[0];
//         setSelectedCamera(defaultCam.id);
//         setLoadingCameras(false);
//       })
//       .catch((err) => {
//         console.error("No se pudieron obtener cámaras:", err);
//         setLoadingCameras(false);
//       });
//   }, []);

//   // Inicializar escáner cuando cambia la cámara seleccionada
//   useEffect(() => {
//     if (!selectedCamera) return;

//     const html5QrCode = new Html5Qrcode(SCANNER_ID);
//     scannerRef.current = html5QrCode;

//     html5QrCode
//       .start(
//         selectedCamera,
//         {
//           fps: 10,
//           qrbox: { width: 250, height: 250 },
//         },
//         (decodedText) => {
//           console.log("Detectado:", decodedText);
//           setScanningText(decodedText);
//           onDetected(decodedText);
//           html5QrCode
//             .stop()
//             .then(() => onClose())
//             .catch(console.error);
//         },
//         () => {}
//       )
//       .catch((err) => {
//         console.error("Error al iniciar el escáner:", err);
//       });

//     localStorage.setItem(CAMERA_KEY, selectedCamera);

//    return () => {
//   const state = html5QrCode.getState();
//   if (
//     state === Html5QrcodeScannerState.SCANNING ||
//     state === Html5QrcodeScannerState.PAUSED
//   ) {
//     html5QrCode.stop().then(onClose).catch(console.error);
//   } else {
//     onClose();
//   }
// };

//   }, [selectedCamera, onDetected, onClose]);

//   if (loadingCameras) {
//     return (
//       <Box textAlign="center" p={2}>
//         <CircularProgress />
//         <Typography variant="body2">Buscando cámaras...</Typography>
//       </Box>
//     );
//   }

//   if (!cameras.length) {
//     return (
//       <Box textAlign="center" p={2}>
//         <Alert severity="warning">No se encontraron cámaras.</Alert>
//         <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
//           Cerrar
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box
//     sx={{
//       position: "relative",
//       width: "100%",
//       zIndex: 10,
//     }}>
//       <FormControl fullWidth sx={{ mb: 1 }}>
//         <InputLabel>Cámara</InputLabel>
//         <Select
//           value={selectedCamera}
//           label="Cámara"
//           onChange={(e) => setSelectedCamera(e.target.value)}
//         >
//           {cameras.map((cam) => (
//             <MenuItem key={cam.id} value={cam.id}>
//               {cam.label || cam.id}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>


//       {/* <div id={SCANNER_ID} style={{ width: "100%", aspectRatio: "4/3" }}></div> */}


// <Box
//   sx={{
//     width: "100%",
//     maxWidth: 500,
//     mx: "auto",
//     overflow: "hidden",
//     borderRadius: 2,
//     backgroundColor: "#000",
//   }}
// >
//   <div
//     id={SCANNER_ID}
//     style={{
//       width: "100%",
//       aspectRatio: "4/3",
//     }}
//   />
// </Box>

//       {scanningText && (
//         <Alert severity="info" sx={{ mt: 2 }}>
//           Código detectado: <strong>{scanningText}</strong>
//         </Alert>
//       )}

//       <Button
//         variant="contained"
//         color="error"
//         fullWidth
//         onClick={() => {
//           const scanner = scannerRef.current;
//           if (scanner) {
//             const state = scanner.getState();
//             if (
//               state === Html5QrcodeScannerState.SCANNING ||
//               state === Html5QrcodeScannerState.PAUSED
//             ) {
//               scanner.stop().then(onClose).catch(console.error);
//             } else {
//               onClose();
//             }
//           } else {
//             onClose();
//           }
//         }}
//         sx={{ mt: 2 }}
//       >
//         Cancelar
//       </Button>
//     </Box>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const SCANNER_ID = "html5qr-reader";
const CAMERA_KEY = "preferred-camera-id";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanningText, setScanningText] = useState("");
  const [loadingCameras, setLoadingCameras] = useState(true);

  // Obtener cámaras disponibles
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);

        const savedCamera = localStorage.getItem(CAMERA_KEY);

        const defaultCam =
          devices.find((d) => d.id === savedCamera) || devices[0];

        setSelectedCamera(defaultCam.id);
        setLoadingCameras(false);
      })
      .catch((err) => {
        console.error("No se pudieron obtener cámaras:", err);
        setLoadingCameras(false);
      });
  }, []);

  // Inicializar escáner cuando cambia la cámara seleccionada
  useEffect(() => {
    if (!selectedCamera) return;

    const html5QrCode = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        selectedCamera,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        (decodedText) => {
          console.log("Detectado:", decodedText);

          setScanningText(decodedText);

          onDetected(decodedText);

          html5QrCode
            .stop()
            .then(() => onClose())
            .catch(console.error);
        },
        () => {}
      )
      .catch((err) => {
        console.error("Error al iniciar el escáner:", err);
      });

    localStorage.setItem(CAMERA_KEY, selectedCamera);

    return () => {
      const state = html5QrCode.getState();

      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        html5QrCode.stop().then(onClose).catch(console.error);
      } else {
        onClose();
      }
    };
  }, [selectedCamera, onDetected, onClose]);

  if (loadingCameras) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1500,
          backgroundColor: "background.paper",
          p: 2,
          textAlign: "center",
          boxShadow: 3,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Buscando cámaras...
        </Typography>
      </Box>
    );
  }

  if (!cameras.length) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1500,
          backgroundColor: "background.paper",
          p: 2,
          boxShadow: 3,
        }}
      >
        <Alert severity="warning">No se encontraron cámaras.</Alert>

        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ mt: 2 }}
        >
          Cerrar
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1500,
        backgroundColor: "background.paper",
        boxShadow: 4,
        p: 1.5,
      }}
    >
      {/* Cámara */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          overflow: "hidden",
          borderRadius: 2,
          backgroundColor: "#000",
        }}
      >
        <div
          id={SCANNER_ID}
          style={{
            width: "100%",
            aspectRatio: "4/3",
          }}
        />
      </Box>

      {/* Selector de cámara */}
      <FormControl
        fullWidth
        size="small"
        sx={{
          mt: 1.5,
        }}
      >
        <InputLabel>Cámara</InputLabel>

        <Select
          value={selectedCamera}
          label="Cámara"
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          {cameras.map((cam) => (
            <MenuItem key={cam.id} value={cam.id}>
              {cam.label || cam.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Código detectado */}
      {scanningText && (
        <Alert
          severity="info"
          sx={{
            mt: 1,
            py: 0.5,
          }}
        >
          Código detectado: <strong>{scanningText}</strong>
        </Alert>
      )}

      {/* Cancelar */}
      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={() => {
          const scanner = scannerRef.current;

          if (scanner) {
            const state = scanner.getState();

            if (
              state === Html5QrcodeScannerState.SCANNING ||
              state === Html5QrcodeScannerState.PAUSED
            ) {
              scanner.stop().then(onClose).catch(console.error);
            } else {
              onClose();
            }
          } else {
            onClose();
          }
        }}
        sx={{
          mt: 1,
        }}
      >
        Cancelar
      </Button>
    </Box>
  );
}
