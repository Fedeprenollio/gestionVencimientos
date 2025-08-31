import { useState } from "react";
import { Fab, Dialog, DialogContent, Typography, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { QRCodeCanvas } from "qrcode.react";

function WhatsAppFloating() {
  const [open, setOpen] = useState(false);

  const numero = "5493513981566";
  const mensaje = "Hola, quiero hacer una consulta";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <>
      <Fab
        color="success"
        aria-label="whatsapp"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <WhatsAppIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent sx={{ textAlign: "center", p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ¿Tenés dudas o sugerencias?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Escaneá el QR o hacé click en el botón para escribirme por WhatsApp.
          </Typography>
          <QRCodeCanvas value={url} size={200} style={{ margin: "16px 0" }} />
          <Button
            variant="contained"
            color="success"
            href={url}
            target="_blank"
            fullWidth
          >
            Abrir WhatsApp
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default WhatsAppFloating;
