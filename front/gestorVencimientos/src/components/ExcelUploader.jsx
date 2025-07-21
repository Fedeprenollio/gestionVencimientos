import { Button } from "@mui/material";
import * as XLSX from "xlsx";
import { saveMovimientos } from "../../utils/indexedDB";
const productosExcluir = ["ROLLOS FISCALES NUEVOS", "VOLIGOMA", "RESMA"];

export default function ExcelUploader({ label, onDataParsed, tipo, onMetaParsed }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

  const productosExcluir = ["ROLLOS FISCALES NUEVOS ", "VOLIGOMA ", "RESMA ","CINTEX MOSTRADOR ","BOBINA PAPEL ESENCIA 40 CM PAP", "BOBINA PAPEL ESENCIA 40 CM PAP "];

reader.onload = async (evt) => {
  const data = new Uint8Array(evt.target.result);
  const workbook = XLSX.read(data, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const parsedData = XLSX.utils.sheet_to_json(worksheet);

  const filteredData = parsedData.filter(
    (item) => !productosExcluir.includes(item.producto)
  );

  onDataParsed(filteredData);

  // Metadata del archivo
  const metadata = {
    fileName: file.name,
    uploadDate: new Date().toISOString(),
  };

  if (tipo === "movimientos") {
    await saveMovimientos(filteredData);
    localStorage.setItem("movimientos_meta", JSON.stringify(metadata));
  } else if (tipo === "stock") {
    localStorage.setItem("stock", JSON.stringify(filteredData));
    localStorage.setItem("stock_meta", JSON.stringify(metadata));
  }

  if (onMetaParsed) {
    onMetaParsed(metadata);
  }
};

    reader.readAsArrayBuffer(file);
  };

  return (
    <Button variant="contained" component="label">
      {label}
      <input hidden type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
    </Button>
  );
}
