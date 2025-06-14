import { useState } from "react";
import BarcodeScanner from "./BarcodeScanner.jsx";
import axios from "axios";

export default function ProductForm({ onAdded }) {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("medicamento");

  const [showScanner, setShowScanner] = useState(false);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const expirationDate = new Date(
        `${expYear}-${expMonth}-01`
      ).toISOString();

      await axios.post(import.meta.env.VITE_API_URL + "/products", {
        barcode,
        name,
        type,
        expirationDate,
        branch: "sucursal1",
      });
      setBarcode("");
      setName("");
      setExpMonth("");
      setExpYear("");
      onAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <form onSubmit={submit}>
        <div>
          <label>Código de barras:</label>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
          />
          <button type="button" onClick={() => setShowScanner((v) => !v)}>
            {showScanner ? "Cerrar scanner" : "Escanear"}
          </button>
        </div>
        {showScanner && (
          <BarcodeScanner
            onResult={(code) => {
              setBarcode(code);
              setShowScanner(false);
            }}
          />
        )}
        <div>
          <label>Nombre:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tipo:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="medicamento">Medicamento</option>
            <option value="perfumeria">Perfumería</option>
          </select>
        </div>

        <div>
          <label>Vence en:</label>
          <select
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value)}
            required
          >
            <option value="">Mes</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>

          <select
            value={expYear}
            onChange={(e) => setExpYear(e.target.value)}
            required
          >
            <option value="">Año</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <button type="submit">Agregar</button>
      </form>
    </>
  );
}
