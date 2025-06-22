import React from "react";
import {
  TextField,
  Button,
  Grid,
  Autocomplete,
} from "@mui/material";
import BarcodeScanner from "../barcodeScanner/BarcodeScanner";

export default function BarcodeSearchSection({
  barcode,
  setBarcode,
  nameQuery,
  setNameQuery,
  nameResults,
  setProductExists,
  setProductInfo,
  handleSearch,
  handleDetected,
  scanning,
  setScanning,
  barcodeInputRef,
}) {
  return (
    <>
      <Autocomplete
        options={nameResults}
        getOptionLabel={(option) => option.name}
        onInputChange={(e, newValue) => setNameQuery(newValue)}
        onChange={(e, selected) => {
          if (selected) {
            setBarcode(selected.barcode);
            setProductExists(true);
            setProductInfo({
              id: selected._id,
              name: selected.name,
              type: selected.type,
            });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Buscar por nombre" fullWidth sx={{ mb: 2 }} />
        )}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(barcode);
        }}
      >
        <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs>
            <TextField
              label="Código de barras"
              value={barcode}
              onChange={(e) => {
                setBarcode(e.target.value);
                setProductExists(null);
                setProductInfo({ name: "", type: "medicamento", id: "" });
              }}
              fullWidth
              required
              inputRef={barcodeInputRef}
            />
          </Grid>
          <Grid item>
            <Button type="submit" variant="outlined" disabled={!barcode}>
              Buscar
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={() => setScanning(true)}>
              Escanear
            </Button>
          </Grid>
        </Grid>
      </form>

      {scanning && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}
    </>
  );
}
