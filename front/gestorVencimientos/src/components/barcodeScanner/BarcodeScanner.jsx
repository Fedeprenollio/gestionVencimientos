import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected, onClose }) {
  useEffect(() => {
    const scanner = new Html5Qrcode("barcode-scanner");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onDetected(decodedText);
          scanner.stop().then(onClose).catch(() => {});
        },
        () => {} // ignorar errores de escaneo individuales
      )
      .catch((err) => {
        console.error("Error iniciando escáner", err);
        alert("No se pudo acceder a la cámara. Verifica permisos o dispositivo.");
        onClose();
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div
      id="barcode-scanner"
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: 8,
        overflow: "hidden",
      }}
    />
  );
}
