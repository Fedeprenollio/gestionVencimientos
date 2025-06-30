import React, { useRef } from "react";
import { TextField, Button, Grid, Autocomplete, Box, Typography } from "@mui/material";
import BarcodeScanner from "../barcodeScanner/BarcodeScanner";

export default function BarcodeSearchSection({
  barcode,
  setBarcode,
  setNameQuery,
  nameResults,
  setProductExists,
  setProductInfo,
  handleSearch,
  handleDetected,
  scanning,
  setScanning,
  barcodeInputRef,
  isAddMode 
}) {
  

console.log("isAddMode",isAddMode)

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        p: 2,
        borderRadius: 2,
        mb: 3,
        border: "1px solid #ddd",
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Escaneá o ingresá un código de barras, o buscá el nombre del producto para verificar si ya existe.
      </Typography>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(barcode);
        }}
      >
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4} minWidth={200}>
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
                <TextField {...params} label="Buscar por nombre" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
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

          <Grid item xs={12} sm="auto">
            <Button type="submit" variant="outlined" disabled={!barcode}>
              {isAddMode ? "Agregar" : "Buscar"}
            </Button>
          </Grid>

          {/* <Grid item>
            <Button variant="outlined" onClick={() => setScanning(true)}>
              Escanear
            </Button>
          </Grid> */}
        </Grid>
      </form>

      {scanning && (
        <BarcodeScanner
          onDetected={handleDetected}
          onClose={() => setScanning(false)}
        />
      )}
    </Box>
  );
}
