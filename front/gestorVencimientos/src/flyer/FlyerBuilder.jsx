import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { toPng } from "html-to-image";
const colorPresets = {
  rosa: {
    name: "Rosa",
    background: "rgb(253,238,245)",
    text: "rgb(238,135,180)",
  },
  celeste: {
    name: "Celeste",
    background: "rgb(225,244,251)",
    text: "rgb(53,173,225)",
  },
  amarillo: {
    name: "Amarillo",
    background: "rgb(254,247,229)",
    text: "rgb(243,171,11)",
  },
};
export default function FlyerBuilder() {
  const flyerRef = useRef(null);
  const [preset, setPreset] = useState("rosa");
  const [data, setData] = useState({
    line1: "Carefree",
    line2: "Protección Compact",
    line3: "x 20 unidades",
    discount: 25,
    price: 3054,
    image: "",
  });
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };
  const handleImage = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setData({ ...data, image: url });
  };
  const downloadFlyer = async () => {
    const node = flyerRef.current;
    const dataUrl = await toPng(node);
    const link = document.createElement("a");
    link.download = "flyer.png";
    link.href = dataUrl;
    link.click();
  };
  const colors = colorPresets[preset];
  return (
    <Box sx={{ display: "flex", gap: 4, padding: 4 }}>
      {" "}
      {/* PANEL EDICION */}{" "}
      <Box
        sx={{ width: 300, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {" "}
        <Typography variant="h6">Colores</Typography>{" "}
        <Select value={preset} onChange={(e) => setPreset(e.target.value)}>
          {" "}
          {Object.entries(colorPresets).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {" "}
              {value.name}{" "}
            </MenuItem>
          ))}{" "}
        </Select>{" "}
        <TextField
          label="Descripción línea 1"
          value={data.line1}
          onChange={(e) => handleChange("line1", e.target.value)}
        />{" "}
        <TextField
          label="Descripción línea 2"
          value={data.line2}
          onChange={(e) => handleChange("line2", e.target.value)}
        />{" "}
        <TextField
          label="Descripción línea 3"
          value={data.line3}
          onChange={(e) => handleChange("line3", e.target.value)}
        />{" "}
        <TextField
          label="Descuento (%)"
          type="number"
          value={data.discount}
          onChange={(e) => handleChange("discount", e.target.value)}
        />{" "}
        <TextField
          label="Precio"
          value={data.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />{" "}
        <Button variant="contained" component="label">
          {" "}
          Subir imagen <input hidden type="file" onChange={handleImage} />{" "}
        </Button>{" "}
        <Button variant="contained" onClick={downloadFlyer}>
          {" "}
          Descargar Flyer{" "}
        </Button>{" "}
      </Box>{" "}
      {/* PREVIEW CARD */}{" "}
      <Box
        ref={flyerRef}
        sx={{
          // Cambiamos a Red Hat Display que es la que cargamos
          fontFamily: "'Red Hat Display', sans-serif",
          width: 240,
          height: 320,
          background: colors.background,
          borderRadius: "18px",
          padding: 2,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {" "}
        {/* BURBUJA DESCUENTO */}{" "}
        <Box
          sx={{
            position: "absolute",
            top: -15,
            right: -15,
            background: "#FFA726",
            width: 70,
            height: 70,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "white",
            fontSize: 18,
            boxShadow: 3,
          }}
        >
          {" "}
          {data.discount}%{" "}
        </Box>{" "}
        {/* IMAGEN */}{" "}
        <Box
          sx={{
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          {data.image && (
            <img
              src={data.image}
              alt="product"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}{" "}
        </Box>{" "}
        {/* DESCRIPCION */}{" "}
        <Box>
          {" "}
          <Typography
            sx={{
              color: colors.text,
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1.1,
            }}
          >
            {" "}
            {data.line1}{" "}
          </Typography>{" "}
          <Typography
            sx={{
              color: colors.text,
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.1,
            }}
          >
            {" "}
            {data.line2}{" "}
          </Typography>{" "}
          <Typography sx={{ color: colors.text, fontSize: 12 }}>
            {" "}
            {data.line3}{" "}
          </Typography>{" "}
        </Box>{" "}
        {/* PRECIO */}{" "}
       {/* SECCION PRECIO */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center", // Cambié a baseline para que el $ y el número alineen mejor
      gap: "2px",
    }}
  >
    <Typography
      sx={{
        fontFamily: "inherit",
        color: colors.text,
        fontSize: 30,
        fontWeight: 300,
        lineHeight: 1
      }}
    >
      $
    </Typography>

    <Typography
      sx={{
        fontFamily: "inherit",
        color: colors.text,
        fontSize: 48, // Un poco más grande para que luzca la tipografía
        fontWeight: 800, // Peso fuerte para que el 9 se vea bien marcado
        letterSpacing: "-2px",
        lineHeight: 1,
        // Esto ayuda a que los números se vean más "de sistema"
        fontFeatureSettings: "'tnum' on, 'lnum' on", 
      }}
    >
      {data.price}
    </Typography>
  </Box>
        <Typography sx={{ fontSize: 10, color: colors.text, opacity: 0.7 }}>
          {" "}
          PRECIO FINAL CON DESCUENTO{" "}
        </Typography>{" "}
      </Box>{" "}
    </Box>
  );
}
