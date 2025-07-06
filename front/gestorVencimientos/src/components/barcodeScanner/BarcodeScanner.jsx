// import { useEffect, useRef, useState } from "react";
// import Quagga from "quagga";
// import {
//   Box,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   CircularProgress,
//   Typography,
//   Alert,
// } from "@mui/material";

// export default function BarcodeScanner({ onDetected, onClose }) {
//   const containerRef = useRef(null);
//   const [devices, setDevices] = useState([]);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
//   const [loadingDevices, setLoadingDevices] = useState(true);

//   // Enumerar cámaras disponibles
//   useEffect(() => {
//     (async () => {
//       try {
//         const all = await navigator.mediaDevices.enumerateDevices();
//         const videoInputs = all.filter((d) => d.kind === "videoinput");
//         setDevices(videoInputs);
//         if (videoInputs.length) setSelectedDeviceId(videoInputs[0].deviceId);
//       } catch (err) {
//         console.error("Error enumerando dispositivos:", err);
//       } finally {
//         setLoadingDevices(false);
//       }
//     })();
//   }, []);

//   // (Re)iniciar Quagga cuando cambie la cámara seleccionada
//   useEffect(() => {
//     if (!selectedDeviceId) return;

//     // Cleanup previa instancia
//     try { Quagga.stop(); } catch {};
//     try { Quagga.offDetected(); } catch {};

//     Quagga.init(
//       {
//         inputStream: {
//           type: "LiveStream",
//           target: containerRef.current,
//           constraints: { deviceId: selectedDeviceId, facingMode: "environment" },
//         },
//         decoder: { readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"] },
//       },
//       (err) => {
//         if (err) {
//           console.error("Quagga init error:", err);
//           return;
//         }
//         try { Quagga.start(); } catch (e) { console.warn("Error starting Quagga:", e); }
//       }
//     );

//     Quagga.onDetected((data) => {
//       const code = data.codeResult.code;
//       console.log("Código detectado:", code);
//       onDetected(code);
//       try { Quagga.stop(); } catch {};
//       onClose();
//     });

//     // Cleanup al desmontar o al cambiar cámara
//     return () => {
//       try { Quagga.stop(); } catch {};
//       try { Quagga.offDetected(); } catch {};
//     };
//   }, [selectedDeviceId, onDetected, onClose]);

//   if (loadingDevices) {
//     return (
//       <Box textAlign="center" p={2}>
//         <CircularProgress />
//         <Typography variant="body2">Buscando cámaras...</Typography>
//       </Box>
//     );
//   }

//   if (!devices.length) {
//     return (
//       <Box textAlign="center" p={2}>
//         <Alert severity="warning">No se encontraron cámaras disponibles.</Alert>
//         <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       {devices.length > 1 && (
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel>Cámara</InputLabel>
//           <Select
//             label="Cámara"
//             value={selectedDeviceId}
//             onChange={(e) => setSelectedDeviceId(e.target.value)}
//           >
//             {devices.map((d) => (
//               <MenuItem key={d.deviceId} value={d.deviceId}>
//                 {d.label || d.deviceId}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}

//       <div
//         ref={containerRef}
//         style={{ width: "100%", position: "relative", aspectRatio: "4/3" }}
//       />

//       <Button
//         variant="contained"
//         color="error"
//         fullWidth
//         onClick={() => {
//           try { Quagga.stop(); } catch {};
//           onClose();
//         }}
//         sx={{ mt: 2 }}
//       >
//         Cancelar
//       </Button>
//     </Box>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
        const defaultCam = devices.find((d) => d.id === savedCamera) || devices[0];
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
          qrbox: { width: 250, height: 250 },
        },
        (decodedText, decodedResult) => {
          console.log("Detectado:", decodedText);
          setScanningText(decodedText);
          onDetected(decodedText);
          html5QrCode.stop().then(() => onClose()).catch(console.error);
        },
        (error) => {
          // escaneo fallido (no hace falta mostrar)
        }
      )
      .catch((err) => {
        console.error("Error al iniciar el escáner:", err);
      });

    // Guardar en localStorage
    localStorage.setItem(CAMERA_KEY, selectedCamera);

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, [selectedCamera, onDetected, onClose]);

  if (loadingCameras) {
    return (
      <Box textAlign="center" p={2}>
        <CircularProgress />
        <Typography variant="body2">Buscando cámaras...</Typography>
      </Box>
    );
  }

  if (!cameras.length) {
    return (
      <Box textAlign="center" p={2}>
        <Alert severity="warning">No se encontraron cámaras.</Alert>
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <div id={SCANNER_ID} style={{ width: "100%", aspectRatio: "4/3" }}></div>

      {scanningText && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Código detectado: <strong>{scanningText}</strong>
        </Alert>
      )}

      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={() => {
          if (scannerRef.current) {
            scannerRef.current.stop().then(onClose).catch(console.error);
          } else {
            onClose();
          }
        }}
        sx={{ mt: 2 }}
      >
        Cancelar
      </Button>
    </Box>
  );
}
