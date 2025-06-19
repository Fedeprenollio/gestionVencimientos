import BarcodeScanner from "../components/barcodeScanner/BarcodeScanner";

export default function Escaneo() {
  return (
    <div>
      <h2>Escaneo de Productos</h2>
      <BarcodeScanner onDetected={(code) => alert("Detectado: " + code)} />
    </div>
  );
}
