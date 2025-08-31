import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Box, Typography, Button } from "@mui/material";

const WhatsAppQR = () => {
  const numero = "5493513981566"; // 👈 tu número en formato internacional
  const mensaje = "Hola, quiero hacer una consulta"; // 👈 mensaje opcional
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="100vh"
      px={2}
    >
      <Typography variant="h5" gutterBottom>
        ¿Tenés dudas o sugerencias?
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Escaneá este código QR o hacé click en el botón para escribirme por
        WhatsApp.
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Podés consultarme sobre el funcionamiento de la app o enviarme ideas
        para mejoras y cambios que te gustaría ver.
      </Typography>

      <Box mt={2} mb={2}>
        <QRCodeCanvas value={url} size={220} />
      </Box>

      <Button
        variant="contained"
        color="success"
        href={url}
        target="_blank"
        sx={{ mt: 1 }}
      >
        Abrir WhatsApp
      </Button>
    </Box>
  );
};

export default WhatsAppQR;
