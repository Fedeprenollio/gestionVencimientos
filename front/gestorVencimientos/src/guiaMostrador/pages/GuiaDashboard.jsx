// import {
//   Box,
//   Drawer,
//   List,
//   ListItemButton,
//   ListItemText,
//   Typography,
//   TextField,
//   Card,
//   CardContent,
//   Divider,
//   Alert,
//   Stack,
//   Button,
//   Chip,
//   IconButton,
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// // Asegúrate de que las rutas de tus archivos de datos sean correctas
// import { guiaData } from "../data/guia.js";
// import { farmacosData } from "../data/farmacos.js";
// import { gruposInfo } from "../data/gruposInfo.js";

// const drawerWidth = 280;

// export const GuiaDashboard = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();

//   // Detecta si la pantalla es pequeña (celular/tablet)
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   const [query, setQuery] = useState("");
//   const [sintomaActivo, setSintomaActivo] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const buscar = () => {
//     if (!query) return [];
//     const q = query.toLowerCase();
//     return guiaData.sistemas.flatMap((s) =>
//       s.sintomas.filter(
//         (sint) =>
//           sint.nombre.toLowerCase().includes(q) ||
//           sint.keywords?.some((k) => k.toLowerCase().includes(q))
//       )
//     );
//   };

//   const resultados = buscar();

//   // Función para seleccionar síntoma y cerrar drawer en móvil
//   const handleSeleccionarSintoma = (sintoma) => {
//     setSintomaActivo(sintoma);
//     if (isMobile) setMobileOpen(false);
//   };

//   // Contenido del Sidebar (extraído para no repetir código)
//   const drawerContent = (
//     <Box>
//       <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
//         <Typography variant="h6">Guía Mostrador</Typography>
//       </Box>
//       <Divider />
//       <List>
//         {guiaData?.sistemas?.map((sistema) => (
//           <Box key={sistema.id}>
//             <Typography sx={{ px: 2, pt: 2, fontWeight: 'bold', color: 'gray' }} variant="caption">
//               {sistema.nombre.toUpperCase()}
//             </Typography>
//             {sistema?.sintomas?.map((sintoma) => (
//               <ListItemButton
//                 key={sintoma.id}
//                 selected={sintomaActivo?.id === sintoma.id}
//                 onClick={() => handleSeleccionarSintoma(sintoma)}
//               >
//                 <ListItemText primary={sintoma.nombre} />
//               </ListItemButton>
//             ))}
//             <Divider sx={{ my: 1 }} />
//           </Box>
//         ))}
//       </List>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>

//       {/* BOTÓN MENÚ (Solo se ve en móviles) */}
//       {isMobile && (
//         <IconButton
//           color="inherit"
//           aria-label="open drawer"
//           edge="start"
//           onClick={handleDrawerToggle}
//           sx={{
//             position: 'fixed',
//             top: 10,
//             left: 10,
//             zIndex: 1100,
//             bgcolor: 'primary.main',
//             color: 'white',
//             '&:hover': { bgcolor: 'primary.dark' }
//           }}
//         >
//           <MenuIcon />
//         </IconButton>
//       )}

//       {/* COMPONENTE DE NAVEGACIÓN (DRAWER) */}
//       <Box
//         component="nav"
//         sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
//       >
//         {/* Versión Móvil: Se oculta automáticamente al hacer clic fuera */}
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             display: { xs: 'block', md: 'none' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//         >
//           {drawerContent}
//         </Drawer>

//         {/* Versión Escritorio: Siempre visible */}
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', md: 'block' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//           open
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* CONTENIDO PRINCIPAL */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: { xs: 2, md: 4 },
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           mt: { xs: 6, md: 0 }, // Espacio para no chocar con el botón hamburguesa
//           overflowY: "auto"
//         }}
//       >
//         <TextField
//           fullWidth
//           label="Buscar síntoma (ej: Fiebre, Migraña...)"
//           variant="outlined"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           sx={{ mb: 3, bgcolor: 'white' }}
//         />

//         {/* Resultados de búsqueda flotantes */}
//         {query && resultados.length > 0 && (
//           <Card sx={{
//             mb: 3,
//             zIndex: 10,
//             position: 'absolute',
//             width: { xs: '85%', md: '50%' }
//           }}>
//             <CardContent sx={{ p: 0 }}>
//               {resultados.map((r) => (
//                 <ListItemButton
//                   key={r.id}
//                   onClick={() => { handleSeleccionarSintoma(r); setQuery(""); }}
//                 >
//                   <ListItemText primary={r.nombre} />
//                 </ListItemButton>
//               ))}
//             </CardContent>
//           </Card>
//         )}

//         {sintomaActivo && (
//           <Box sx={{ maxWidth: 800, mx: 'auto' }}>
//             <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h4" color="primary" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
//                   {sintomaActivo.nombre}
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                   {sintomaActivo.descripcionBreve}
//                 </Typography>

//                 {/* TRIAGE */}
//                 <Box sx={{ p: 2, bgcolor: '#fff5f5', borderRadius: 2, mb: 3 }}>
//                   <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//                     Preguntas de Triage:
//                   </Typography>
//                   {sintomaActivo.triage?.map((t, i) => (
//                     <Typography key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: t.alertaSi ? "error.main" : "text.primary", fontSize: '0.9rem' }}>
//                       • {t.pregunta} {t.alertaSi && <Chip label="DERIVAR" size="small" color="error" />}
//                     </Typography>
//                   ))}
//                 </Box>

//                 {/* CLAVES DE ATENCIÓN */}
//                 {sintomaActivo.clavesAtencion && (
//                   <Box sx={{ mb: 3, p: 2, bgcolor: "#e3f2fd", borderLeft: "6px solid #1976d2", borderRadius: 1 }}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1565c0", mb: 1 }}>
//                       💡 CLAVES DE ATENCIÓN:
//                     </Typography>
//                     {sintomaActivo.clavesAtencion.map((clave, i) => (
//                       <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {clave}</Typography>
//                     ))}
//                   </Box>
//                 )}

//                 <Divider sx={{ my: 3 }} />

//                 {/* GRUPOS TERAPÉUTICOS */}
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
//                   Opciones Farmacológicas:
//                 </Typography>

//                 {sintomaActivo.gruposRecomendados?.map((recomendacion) => {
//                   const infoGrupo = gruposInfo[recomendacion.id];
//                   return (
//                     <Card variant="outlined" key={recomendacion.id} sx={{ mb: 3, borderRadius: 2 }}>
//                       <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderBottom: '1px solid #eee' }}>
//                         <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "primary.dark" }}>
//                           {infoGrupo?.titulo}
//                         </Typography>
//                         <Typography variant="body2" sx={{ fontStyle: "italic", my: 1 }}>
//                           "{infoGrupo?.explicacion}"
//                         </Typography>
//                         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
//                           <Typography variant="caption" color="success.main"><strong>✓</strong> {infoGrupo?.pros}</Typography>
//                           <Typography variant="caption" color="error.main"><strong>⚠</strong> {infoGrupo?.contras}</Typography>
//                         </Stack>
//                       </Box>

//                       <CardContent>
//                         <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
//                           {recomendacion.farmacosPrincipales.map((fId) => {
//                             const fData = farmacosData.find((f) => f.id === fId);
//                             return fData && (
//                               <Button
//                                 key={fId}
//                                 variant="contained"
//                                 size="small"
//                                 onClick={() => navigate(`/farmacos/${fId}`)}
//                                 sx={{ textTransform: "none", borderRadius: 5 }}
//                               >
//                                 {fData.nombre}
//                               </Button>
//                             );
//                           })}
//                         </Box>
//                         {recomendacion.nota && (
//                           <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
//                             * {recomendacion.nota}
//                           </Typography>
//                         )}
//                       </CardContent>
//                     </Card>
//                   );
//                 })}

//                 {/* CRITERIOS DE DERIVACIÓN */}
//                 {sintomaActivo.criteriosDerivacion && (
//                   <>
//                     <Typography variant="subtitle1" sx={{ mt: 4, color: 'error.main', fontWeight: 'bold' }}>
//                       Derivar al médico si:
//                     </Typography>
//                     {sintomaActivo.criteriosDerivacion.map((d, i) => (
//                       <Alert severity="error" variant="outlined" sx={{ mt: 1 }} key={i}>
//                         {d}
//                       </Alert>
//                     ))}
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  Button,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Grid
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

const drawerWidth = 320;

export const GuiaDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [listaSintomas, setListaSintomas] = useState([]);
  const [sintomaActivo, setSintomaActivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cargar lista para el Sidebar
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await api.get("/guia/lista-patologias");
        setListaSintomas(data);
      } catch (err) {
        console.error("Error cargando menú", err);
      }
    };
    fetchMenu();
  }, []);

  // Cargar detalle completo con Triple Populate
  const handleSeleccionarSintoma = async (id) => {
    setLoading(true);
    try {
      const data = await api.get(`/guia/patologia/${id}`);
      setSintomaActivo(data);
      if (isMobile) setMobileOpen(false);
    } catch (err) {
      console.error("Error al cargar detalle", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">Guía de Mostrador</Typography>
        <Typography variant="caption">Protocolos de Dispensación</Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filtrar síntomas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>
      <Divider />
      <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {listaSintomas
          .filter(s => s.nombre.toLowerCase().includes(query.toLowerCase()))
          .map((sintoma) => (
            <ListItemButton
              key={sintoma._id}
              selected={sintomaActivo?._id === sintoma._id}
              onClick={() => handleSeleccionarSintoma(sintoma._id)}
            >
              <ListItemText 
                primary={sintoma.nombre} 
                secondary={sintoma.categoriaPadre}
              />
            </ListItemButton>
          ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f4f6f8" }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ mb: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
        ) : sintomaActivo ? (
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            
            {/* SECCIÓN 1: TRIAGE Y CLAVES */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 4, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h4" color="primary.dark" fontWeight="800" gutterBottom>
                      {sintomaActivo.nombre}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {sintomaActivo.descripcionBreve}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningAmberIcon color="error" fontSize="small" /> PREGUNTAS DE SEGURIDAD (TRIAGE)
                    </Typography>
                    <Stack spacing={1}>
                      {sintomaActivo.triage.map((t, i) => (
                        <Box key={i} sx={{ p: 1.5, bgcolor: t.alertaSi ? '#fff1f0' : '#f0f7ff', borderRadius: 2, borderLeft: `4px solid ${t.alertaSi ? '#ff4d4f' : '#1890ff'}` }}>
                          <Typography variant="body2">
                            {t.pregunta} {t.alertaSi && <strong>(SI → DERIVAR)</strong>}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 4, bgcolor: '#2c3e50', color: 'white', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon fontSize="small" /> Claves de Atención
                    </Typography>
                    <List dense>
                      {sintomaActivo.clavesAtencion.map((clave, i) => (
                        <ListItemText key={i} primary={`• ${clave}`} sx={{ mb: 1 }} />
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* SECCIÓN 2: GRUPOS Y FÁRMACOS */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Tratamientos Sugeridos</Typography>
            
            {sintomaActivo.gruposRecomendados.map((item, i) => (
              <Box key={i} sx={{ mb: 5 }}>
                <Box sx={{ mb: 2, pl: 1, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                  <Typography variant="h6" color="secondary.main" fontWeight="bold">
                    {item.grupo.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary italic">
                    {item.grupo.explicacion}
                  </Typography>
                  {item.nota && <Chip label={`Nota: ${item.nota}`} size="small" sx={{ mt: 1, bgcolor: '#fffbe6' }} />}
                </Box>

                <Grid container spacing={2}>
                  {item.grupo.farmacos.map((f) => (
                    <Grid item xs={12} sm={6} key={f._id}>
                      <Card variant="outlined" sx={{ borderRadius: 3, '&:hover': { boxShadow: 3 } }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {f.nombre}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Marcas: {f.marcasComerciales?.join(", ") || "Genéricos / Varios"}
                          </Typography>

                          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {f.principiosActivos.map(pa => (
                              <Chip 
                                key={pa._id} 
                                label={pa.nombre} 
                                size="small" 
                                onClick={() => navigate(`/principio-activo/${pa._id}`)}
                                sx={{ cursor: 'pointer', fontWeight: '500' }}
                                color="default"
                                variant="outlined"
                              />
                            ))}
                          </Box>

                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Dosis:</strong> {f.dosisHabitual?.adulto || "Consultar prospecto"}
                          </Typography>

                          <Button 
                            variant="contained" 
                            fullWidth 
                            size="small"
                            onClick={() => navigate(`/farmaco/${f._id}`)}
                            sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
                          >
                            Ver Protocolo y Advertencias
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 20 }}>
            <Typography variant="h5" color="text.disabled">Selecciona una patología del menú lateral</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};