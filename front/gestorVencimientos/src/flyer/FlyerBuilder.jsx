import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button
} from "@mui/material";

const colors = {
  rosa: {
    bg: "#f6d9e5",
    card: "#f9e6ee",
    text: "#d96b9c"
  },
  celeste: {
    bg: "#d6eaf5",
    card: "#e6f3f9",
    text: "#3c9ac6"
  },
  amarillo: {
    bg: "#f6e7c9",
    card: "#f9f0db",
    text: "#e2a400"
  }
};

export default function FlyerEditor() {

  const [rows, setRows] = useState([
    {
      title: "HIGIENE FEMENINA",
      color: "rosa",
      products: [
        {
          name: "Carefree",
          desc: "Protección Compact",
          extra: "Prot. diarios x 20 un.",
          price: "2290.50",
          discount: 25,
          image: ""
        },
        {
          name: "Siempre Libre",
          desc: "Especial Ultrafina",
          extra: "Toallas x 8 un.",
          price: "2185.50",
          discount: 25,
          image: ""
        },
        {
          name: "OB Siempre Libre",
          desc: "Mini / Medio / Super",
          extra: "Tampones x 8 un.",
          price: "3218.80",
          discount: 35,
          image: ""
        }
      ]
    }
  ]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(0);

  const updateProduct = (field, value) => {

    const newRows = [...rows];

    newRows[selectedRow].products[selectedProduct][field] = value;

    setRows(newRows);
  };

  const handleImageUpload = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const newRows = [...rows];

    newRows[selectedRow].products[selectedProduct].image = url;

    setRows(newRows);
  };

  const row = rows[selectedRow];
  const product = row.products[selectedProduct];

  return (

    <Box sx={{ display: "flex", gap: 4, padding: 4 }}>

      {/* PANEL EDITOR */}

      <Box sx={{ width: 320, display: "flex", flexDirection: "column", gap: 2 }}>

        <Typography variant="h6">
          Editor
        </Typography>

        <Select
          value={row.color}
          onChange={(e) => {

            const newRows = [...rows];
            newRows[selectedRow].color = e.target.value;
            setRows(newRows);
          }}
        >
          <MenuItem value="rosa">Rosa</MenuItem>
          <MenuItem value="celeste">Celeste</MenuItem>
          <MenuItem value="amarillo">Amarillo</MenuItem>
        </Select>

        <TextField
          label="Categoría"
          value={row.title}
          onChange={(e) => {

            const newRows = [...rows];
            newRows[selectedRow].title = e.target.value;
            setRows(newRows);
          }}
        />

        <Typography>
          Producto
        </Typography>

        <Select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          {row.products.map((p, i) => (
            <MenuItem key={i} value={i}>
              Producto {i + 1}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Nombre"
          value={product.name}
          onChange={(e) => updateProduct("name", e.target.value)}
        />

        <TextField
          label="Descripción"
          value={product.desc}
          onChange={(e) => updateProduct("desc", e.target.value)}
        />

        <TextField
          label="Extra"
          value={product.extra}
          onChange={(e) => updateProduct("extra", e.target.value)}
        />

        <TextField
          label="Precio"
          value={product.price}
          onChange={(e) => updateProduct("price", e.target.value)}
        />

        <TextField
          label="Descuento"
          type="number"
          value={product.discount}
          onChange={(e) => updateProduct("discount", e.target.value)}
        />

        {/* INPUT IMAGEN */}

        <Button
          variant="contained"
          component="label"
        >
          Subir imagen

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>

      </Box>

      {/* PREVIEW */}

      <Box sx={{ width: 1000 }}>

        {rows.map((row, r) => {

          const palette = colors[row.color];

          return (

            <Box
              key={r}
              sx={{
                background: palette.bg,
                borderRadius: 6,
                padding: 4,
                marginBottom: 6,
                position: "relative"
              }}
            >

              {/* CATEGORY BAR */}

              <Box
                sx={{
                  position: "absolute",
                  top: -18,
                  left: 160,
                  background: palette.text,
                  color: "white",
                  padding: "8px 26px",
                  borderRadius: 40,
                  fontWeight: 700,
                  letterSpacing: 1
                }}
              >
                {row.title}
              </Box>

              {/* PRODUCTS */}

              <Box
                sx={{
                  display: "flex",
                  gap: 3
                }}
              >

                {row.products.map((p, i) => {

                  const [price, cents] = p.price.split(".");

                  return (

                    <Box
                      key={i}
                      onClick={() => {

                        setSelectedRow(r);
                        setSelectedProduct(i);
                      }}
                      sx={{
                        width: 260,
                        background: palette.card,
                        borderRadius: 5,
                        padding: 3,
                        cursor: "pointer"
                      }}
                    >

                      {/* DESCUENTO */}

                      <Typography
                        sx={{
                          fontSize: 56,
                          fontWeight: 800,
                          color: "#f59f00",
                          textAlign: "right"
                        }}
                      >
                        {p.discount}
                      </Typography>

                      <Typography
                        sx={{
                          textAlign: "right",
                          color: "#f59f00",
                          marginTop: -2
                        }}
                      >
                        % OFF
                      </Typography>

                      {/* IMAGEN */}

                      <Box
                        sx={{
                          height: 110,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 1
                        }}
                      >
                        {p.image && (

                          <img
                            src={p.image}
                            alt=""
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain"
                            }}
                          />
                        )}
                      </Box>

                      {/* TEXTO */}

                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: palette.text,
                          fontSize: 20
                        }}
                      >
                        {p.name}
                      </Typography>

                      <Typography sx={{ color: palette.text }}>
                        {p.desc}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: palette.text
                        }}
                      >
                        {p.extra}
                      </Typography>

                      {/* PRECIO */}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-end",
                          marginTop: 1
                        }}
                      >

                        <Typography
                          sx={{
                            fontSize: 26,
                            marginRight: 1,
                            color: palette.text
                          }}
                        >
                          $
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 44,
                            fontWeight: 800,
                            color: palette.text
                          }}
                        >
                          {price}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 18,
                            marginBottom: 1,
                            color: palette.text
                          }}
                        >
                          {cents}
                        </Typography>

                      </Box>

                    </Box>
                  );
                })}

              </Box>

            </Box>
          );
        })}

      </Box>

    </Box>
  );
}