import { Box, Typography, TextField, Button } from "@mui/material";

const EtiquetaPreview = ({ producto, onChange }) => {
  const {
    manualName,
    name,
    discountedPrice,
    manualPrice,
    manualPreviousPrice,
    discount,
    currentPrice,
    barcode,
    tipoEtiqueta,
  } = producto;

  const label =
    tipoEtiqueta === "oferta"
      ? "OFERTA"
      : tipoEtiqueta === "liquidacion"
      ? "LIQUIDACIÓN"
      : tipoEtiqueta === "nuevo"
      ? "NUEVO"
      : "";

  const price = discountedPrice ?? currentPrice ?? 0;
  const prevPrice = manualPreviousPrice ?? currentPrice ?? 0;

  const tipos = [
    { key: "oferta", label: "OFERTA", color: "#d32f2f" }, // rojo
    { key: "nuevo", label: "NUEVO", color: "#1976d2" }, // azul
    { key: "liquidacion", label: "LIQUIDACIÓN", color: "#f9a825" }, // amarillo
  ];

  return (
    <Box
      sx={{
        height: 312,
        border: "1px solid #ccc",
        bgcolor: "#fff",
        position: "relative",
        px: 1.5,
        py: 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial",
        mb: 3, // margen inferior para separar tarjetas
      }}
    >
      {/* Botones tipo etiqueta */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1 }}>
        {tipos.map(({ key, label, color }) => (
          <Button
            key={key}
            size="small"
            variant={tipoEtiqueta === key ? "contained" : "outlined"}
            onClick={() => onChange("tipoEtiqueta", key)}
            sx={{
              textTransform: "uppercase",
              fontWeight: "bold",
              minWidth: 70,
              fontSize: 12,
              borderColor: color,
              color: tipoEtiqueta === key ? "#fff" : color,
              backgroundColor: tipoEtiqueta === key ? color : "transparent",
              "&:hover": {
                backgroundColor: tipoEtiqueta === key ? color : `${color}33`, // un poco transparente
                borderColor: color,
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Typography
        variant="h6"
        sx={{ textAlign: "center", fontWeight: "bold", mt: 0.5, mb: 1 }}
      >
        {label}
      </Typography>

      <TextField
        variant="standard"
        fullWidth
        value={manualName}
        onChange={(e) => onChange("manualName", e.target.value)}
        inputProps={{
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        }}
        sx={{
          my: 1,
          input: { textAlign: "center" },
        }}
      />

      {tipoEtiqueta === "nuevo" ? (
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
          }}
        >
          ${price.toFixed(0)}
        </Typography>
      ) : (
        <>
          <Typography sx={{ textAlign: "center", fontSize: 16, fontWeight: 500 }}>
            {discount}% OFF
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              textDecoration: "line-through",
              color: "#999",
            }}
          >
            ${prevPrice.toFixed(2)}
          </Typography>
          <Typography variant="h3" sx={{ textAlign: "center", fontWeight: "bold", mt: 1 }}>
            ${price.toFixed(0)}
          </Typography>
        </>
      )}

      <Box sx={{ mt: "auto", textAlign: "center", fontSize: 12 }}>
        <Typography variant="caption">{barcode}</Typography>
      </Box>
    </Box>
  );
};

export default EtiquetaPreview;
