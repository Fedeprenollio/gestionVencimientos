// components/UploadStockExcel.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import CompareAndApplyStockImport from "./CompareAndApplyStockImport";
import useBranchStore from "../../store/useBranchStore";
import { useEffect } from "react";


export default function UploadStockExcel() {
  const [file, setFile] = useState(null);
  const [branchId, setBranchId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  // Zustand state
  const { branches, selectedBranchId, setSelectedBranchId, fetchBranches } =
    useBranchStore();

    
  useEffect(() => {
    fetchBranches();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file || !branchId) {
      setMessage({
        type: "error",
        text: "Debés seleccionar un archivo y una sucursal",
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/imports/import-stock`, formData);
      setMessage({
        type: "success",
        text: `Importación exitosa (${res.data.totalRows} filas). ID: ${res.data.importId}`,
      });
      setFile(null);
      setBranchId("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Error al subir archivo",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Subir Excel de Stock por Sucursal
      </Typography>

      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Sucursal</InputLabel>
          <Select
            value={branchId}
            label="Sucursal"
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Seleccionar archivo
          <input type="file" hidden onChange={handleFileChange} />
        </Button>

        {file && (
          <Typography variant="body2">
            Archivo seleccionado: <strong>{file.name}</strong>
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || !branchId || uploading}
        >
          {uploading ? <CircularProgress size={20} /> : "Subir Excel"}
        </Button>

        {message && <Alert severity={message.type}>{message.text}</Alert>}
      </Stack>
      {/* <CompareAndApplyStockImport importId={"687128e916fc667f30603969"} /> */}

    </Paper>
  );
}
