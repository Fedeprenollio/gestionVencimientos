import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  Link,
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LanguageIcon from "@mui/icons-material/Language";
import InstagramIcon from "@mui/icons-material/Instagram";
import StorefrontIcon from "@mui/icons-material/Storefront";

const sucursales = {
  "Cruz del Eje": [
    { nombre: "Eva Perón 1646", tel: ["03549 - 423387"] },
    { nombre: "Sarmiento 315", tel: ["03549 - 15591831"] },
  ],
  "Capilla del Monte": [
    { nombre: "Diag. Bs. As. 118", tel: ["03549 - 423387", "489852"] },
  ],
  "La Cumbre": [
    { nombre: "Belgrano 232", tel: ["03548 - 451245"] },
    { nombre: "25 de Mayo 272", tel: ["03548 - 451083"] },
  ],
  "La Falda": [
    { nombre: "Av. Edén 101", tel: ["03548 - 422101"] },
    { nombre: "Av. Edén 299", tel: ["03548 - 422526"] },
    { nombre: "Av. Edén 370", tel: ["03548 - 426479"] },
    { nombre: "Av. Edén 604", tel: ["03548 - 422732"] },
    { nombre: "9 de Julio", tel: ["03548 - 423795"] },
    { nombre: "Av. Kennedy 166", tel: ["03548 - 425766"] },
    { nombre: "España 103", tel: ["03548 - 423276"] },
    { nombre: "Sarmiento 346", tel: ["03548 - 425376"] },
    { nombre: "Av. Buenos Aires 887", tel: ["03548 - 536591"] },
  ],
  "Cosquín": [
    { nombre: "Av. San Martín 1125", tel: ["0354 - 1452777"] },
    { nombre: "Pte. Perón 803", tel: ["0354 - 1450916"] },
  ],
  "Villa Allende": [
    { nombre: "Av. Goycoechea 557", tel: ["0351 - 152027852"] },
  ],
  "Córdoba": [
    { nombre: "Dean Funes 1226", tel: ["0351 - 4276081", "0351 - 4276085"] },
    { nombre: "Buenos Aires 128", tel: ["03548 - 15568786"] },
    { nombre: "27 de Abril 668", tel: ["0351 - 155950231"] },
  ],
  "Farm (Villa Giardino)": [
    { nombre: "", tel: ["491175", "03548 - 584705"] },
  ],
};


// Íconos según categoría o nombre
const getIcon = (categoria, nombre) => {
  if (categoria === "Obras Sociales / Validaciones") return <LocalHospitalIcon sx={{ mr: 1 }} />;
  if (categoria === "Droguerías") return <LocalPharmacyIcon sx={{ mr: 1 }} />;
  if (nombre.toLowerCase().includes("instagram")) return <InstagramIcon sx={{ mr: 1 }} />;
  if (nombre.toLowerCase().includes("shop")) return <StorefrontIcon sx={{ mr: 1 }} />;
  if (categoria === "Web y Redes Sociales") return <LanguageIcon sx={{ mr: 1 }} />;
  return null;
};
const linksUtiles = {
  "Obras Sociales / Validaciones": [
    { nombre: "PAMI", url: "https://www.pami.org.ar/" },
    { nombre: "Mis Validaciones", url: "https://www.misvalidaciones.com.ar/" },
    { nombre: "IMED", url: "https://www.imed.com.ar/" },
  ],
  "Droguerías": [
    { nombre: "Droguería del Sud", url: "https://www.delsud.com.ar/" },
    { nombre: "Cofarsur", url: "https://www.cofarsur.com.ar/" },
    { nombre: "Kellerhoff", url: "https://www.kellerhoff.com.ar/" },
  ],
  "Web y Redes Sociales": [
    {
      nombre: "Instagram VIG Farma",
      url: "https://www.instagram.com/redvigfarma_/",
    },
    {
      nombre: "Sitio Web VIG Farma",
      url: "https://vigfarma.com.ar/farmacia/",
    },
    {
      nombre: "E‑shop VIG Farma",
      url: "https://vigfarma.com.ar/farmacia/",
    },
  ],
};


const SucursalesContactList = () => {
  return (
   <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Typography variant="h5" gutterBottom textAlign="center">
      📍 Sucursales y Teléfonos Útiles
    </Typography>

    <Grid container spacing={3}>
      {Object.entries(sucursales).map(([ciudad, locales]) => (
        <Grid item xs={12} sm={6} md={4} key={ciudad}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                {ciudad}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {locales.map((sucursal, i) => (
                <Box key={i} mb={1}>
                  {sucursal.nombre && (
                    <Typography variant="body1" fontWeight={500}>
                      {sucursal.nombre}
                    </Typography>
                  )}
                  {sucursal.tel.map((t, j) => (
                    <Button
                      key={j}
                      size="small"
                      color="inherit"
                      href={`tel:${t.replace(/\s+/g, "")}`}
                      startIcon={<LocalHospitalIcon />}
                    >
                      {t}
                    </Button>
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Links útiles */}
    <Box mt={5}>
      <Typography variant="h6" gutterBottom>
        🔗 Links útiles
      </Typography>

      {Object.entries(linksUtiles).map(([categoria, links]) => (
        <Box key={categoria} mt={3}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {categoria}
          </Typography>
          <Grid container spacing={2}>
            {links.map((link) => (
              <Grid item xs={12} sm={6} md={4} key={link.nombre}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener"
                  startIcon={getIcon(categoria, link.nombre)}
                >
                  {link.nombre}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  </Box>
  );
};

export default SucursalesContactList;
