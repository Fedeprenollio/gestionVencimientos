import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider
} from "@mui/material";

export default function PlexLabelGenerator() {

  const [codesInput, setCodesInput] = useState("");
  const [excelCodes, setExcelCodes] = useState([]);
  const [fileName, setFileName] = useState("plex_codigos");

  // ---------------- detectar codigo de barras ----------------

  const isBarcode = (value) => {
    if (!value) return false;
    const v = value.toString().replace(/\D/g, "");
    return v.length >= 8 && v.length <= 14;
  };

  // ---------------- convertir notación científica ----------------

  const convertScientificToString = (value) => {

    if (!value) return "";

    if (typeof value === "number") {
      return value.toLocaleString("fullwide", { useGrouping: false });
    }

    if (typeof value === "string") {

      const clean = value.replace(",", ".").trim();

      if (clean.toUpperCase().includes("E")) {
        const num = Number(clean);
        return num.toLocaleString("fullwide", { useGrouping: false });
      }

      return clean;
    }

    return "";
  };

  // ---------------- procesar textarea ----------------

  const textareaCodes = useMemo(() => {

    const codes = codesInput
      .split(/[\n,;\t ]+/)
      .map(c => c.trim())
      .filter(Boolean)
      .map(convertScientificToString)
      .filter(isBarcode);

    return codes;

  }, [codesInput]);

  // ---------------- procesar archivo ----------------

  const processFile = (file) => {

    const reader = new FileReader();

    reader.onload = (e) => {

      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const foundCodes = [];

      rows.forEach(row => {

        row.forEach(cell => {

          const converted = convertScientificToString(cell);

          if (isBarcode(converted)) {
            foundCodes.push(converted);
          }

        });

      });

      setExcelCodes(foundCodes);

    };

    reader.readAsArrayBuffer(file);
  };

  // ---------------- drag and drop ----------------

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ---------------- calcular duplicados ----------------

  const duplicates = useMemo(() => {

    const counts = {};
    const dups = [];

    [...textareaCodes, ...excelCodes].forEach(code => {
      counts[code] = (counts[code] || 0) + 1;
    });

    Object.entries(counts).forEach(([code, count]) => {
      if (count > 1) dups.push(code);
    });

    return dups;

  }, [textareaCodes, excelCodes]);

  // ---------------- calcular codigos unicos ----------------

  const uniqueCodes = useMemo(() => {
    return [...new Set([...textareaCodes, ...excelCodes])];
  }, [textareaCodes, excelCodes]);

  // ---------------- generar txt ----------------

  const generateTxt = () => {

    const formatted = uniqueCodes.map(c => `${c};`).join("\n");

    const blob = new Blob([formatted], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // ---------------- render ----------------

  return (

    <Box sx={{ maxWidth: 850, mx: "auto" }}>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Generador de etiquetas Plex
      </Typography>

      <Stack spacing={3}>

        {/* nombre archivo */}

        <Paper sx={{ p: 3 }} elevation={2}>

          <Typography sx={{ mb: 1 }}>
            Nombre del archivo
          </Typography>

          <TextField
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

        </Paper>

        {/* textarea */}

        <Paper sx={{ p: 3 }} elevation={2}>

          <Typography sx={{ mb: 1 }}>
            Pegar códigos manualmente
          </Typography>

          <TextField
            multiline
            minRows={6}
            fullWidth
            placeholder="Pegá códigos separados por enter, coma o espacio"
            value={codesInput}
            onChange={(e) => setCodesInput(e.target.value)}
          />

          <Box sx={{ mt: 2 }}>
            <Chip label={`Detectados: ${textareaCodes.length}`} />
          </Box>

        </Paper>

        {/* drag drop excel */}

        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed #bbb",
            background: "#fafafa"
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >

          <Typography variant="subtitle1">
            Arrastrar Excel / CSV aquí
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            o seleccionar archivo
          </Typography>

          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >

            Seleccionar archivo

            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => processFile(e.target.files[0])}
            />

          </Button>

          <Box sx={{ mt: 2 }}>
            <Chip label={`Detectados desde archivo: ${excelCodes.length}`} color="primary" />
          </Box>

        </Paper>

        {/* resumen */}

        <Paper sx={{ p: 3 }} elevation={2}>

          <Stack direction="row" spacing={2}>

            <Chip label={`Total cargados: ${textareaCodes.length + excelCodes.length}`} />

            <Chip label={`Únicos: ${uniqueCodes.length}`} color="success" />

            <Chip label={`Duplicados: ${duplicates.length}`} color="warning" />

          </Stack>

        </Paper>

        {/* duplicados */}

        {duplicates.length > 0 && (

          <Paper sx={{ p: 3 }}>

            <Typography sx={{ mb: 1 }}>
              Códigos repetidos detectados
            </Typography>

            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: 14,
                background: "#fff3f3",
                p: 2,
                borderRadius: 1,
                maxHeight: 200,
                overflow: "auto"
              }}
            >

              {duplicates.map(code => (
                <div key={code}>{code}</div>
              ))}

            </Box>

          </Paper>

        )}

        {/* boton */}

        <Paper sx={{ p: 3 }} elevation={2}>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >

            <Typography variant="h6">
              Códigos únicos listos: {uniqueCodes.length}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={generateTxt}
              disabled={!uniqueCodes.length}
            >
              Generar TXT para Plex
            </Button>

          </Stack>

        </Paper>

      </Stack>

    </Box>

  );
}