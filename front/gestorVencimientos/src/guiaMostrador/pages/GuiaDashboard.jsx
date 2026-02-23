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
//   ListItem,
//   Chip,
// } from "@mui/material";
// import { useState } from "react";
// import { guiaData } from "../data/guia.js";
// import { useNavigate } from "react-router-dom";
// import { farmacosData } from "../data/farmacos.js";
// import { gruposInfo } from "../data/gruposInfo.js";

// const drawerWidth = 280;

// export const GuiaDashboard = () => {
//   const navigate = useNavigate();
//   const [query, setQuery] = useState("");
//   const [sintomaActivo, setSintomaActivo] = useState(null);

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

//   return (
//     <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
//       {/* SIDEBAR */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
//         }}
//       >
//         <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
//           <Typography variant="h6">Guía Mostrador</Typography>
//         </Box>
//         <Divider />
//         <List>
//           {guiaData?.sistemas?.map((sistema) => (
//             <Box key={sistema.id}>
//               <Typography sx={{ px: 2, pt: 2, fontWeight: 'bold', color: 'gray' }} variant="caption">
//                 {sistema.nombre.toUpperCase()}
//               </Typography>
//               {sistema?.sintomas?.map((sintoma) => (
//                 <ListItemButton
//                   key={sintoma.id}
//                   selected={sintomaActivo?.id === sintoma.id}
//                   onClick={() => setSintomaActivo(sintoma)}
//                 >
//                   <ListItemText primary={sintoma.nombre} />
//                 </ListItemButton>
//               ))}
//               <Divider sx={{ my: 1 }} />
//             </Box>
//           ))}
//         </List>
//       </Drawer>

//       {/* CONTENIDO PRINCIPAL */}
//       <Box sx={{ flexGrow: 1, p: 4, overflowY: "auto" }}>
//         <TextField
//           fullWidth
//           label="Buscar síntoma (ej: Fiebre, Migraña, Muela...)"
//           variant="outlined"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           sx={{ mb: 3, bgcolor: 'white' }}
//         />

//         {query && resultados.length > 0 && (
//           <Card sx={{ mb: 3, zIndex: 10, position: 'absolute', width: '70%' }}>
//             <CardContent>
//               {resultados.map((r) => (
//                 <ListItemButton 
//                   key={r.id} 
//                   onClick={() => { setSintomaActivo(r); setQuery(""); }}
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
//                 <Typography variant="h4" color="primary" gutterBottom>
//                   {sintomaActivo.nombre}
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                   {sintomaActivo.descripcionBreve}
//                 </Typography>

//                 {/* SECCIÓN TRIAGE */}
//                 <Box sx={{ p: 2, bgcolor: '#fff5f5', borderRadius: 2, mb: 3 }}>
//                   <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//                     Preguntas de Triage (Seguridad):
//                   </Typography>
//                   {sintomaActivo.triage?.map((t, i) => (
//                     <Typography key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, color: t.alertaSi ? "error.main" : "text.primary" }}>
//                       • {t.pregunta} {t.alertaSi && <Chip label="DERIVAR" size="small" color="error" />}
//                     </Typography>
//                   ))}
//                 </Box>

//                 {/* CLAVES DE ATENCIÓN (Antes Perlas) */}
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
//                         <Stack direction="row" spacing={2}>
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
//                           <Typography variant="caption" color="text.secondary">
//                             * {recomendacion.nota}
//                           </Typography>
//                         )}
//                         {infoGrupo?.resumenSeguridad && (
//                           <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'orange', fontWeight: 'bold' }}>
//                             Seguridad: {infoGrupo.resumenSeguridad}
//                           </Typography>
//                         )}
//                       </CardContent>
//                     </Card>
//                   );
//                 })}

//                 {/* CRITERIOS DE DERIVACIÓN FINAL */}
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Asegúrate de que las rutas de tus archivos de datos sean correctas
import { guiaData } from "../data/guia.js";
import { farmacosData } from "../data/farmacos.js";
import { gruposInfo } from "../data/gruposInfo.js";

const drawerWidth = 280;

export const GuiaDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Detecta si la pantalla es pequeña (celular/tablet)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [query, setQuery] = useState("");
  const [sintomaActivo, setSintomaActivo] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const buscar = () => {
    if (!query) return [];
    const q = query.toLowerCase();
    return guiaData.sistemas.flatMap((s) =>
      s.sintomas.filter(
        (sint) =>
          sint.nombre.toLowerCase().includes(q) ||
          sint.keywords?.some((k) => k.toLowerCase().includes(q))
      )
    );
  };

  const resultados = buscar();

  // Función para seleccionar síntoma y cerrar drawer en móvil
  const handleSeleccionarSintoma = (sintoma) => {
    setSintomaActivo(sintoma);
    if (isMobile) setMobileOpen(false);
  };

  // Contenido del Sidebar (extraído para no repetir código)
  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Guía Mostrador</Typography>
      </Box>
      <Divider />
      <List>
        {guiaData?.sistemas?.map((sistema) => (
          <Box key={sistema.id}>
            <Typography sx={{ px: 2, pt: 2, fontWeight: 'bold', color: 'gray' }} variant="caption">
              {sistema.nombre.toUpperCase()}
            </Typography>
            {sistema?.sintomas?.map((sintoma) => (
              <ListItemButton
                key={sintoma.id}
                selected={sintomaActivo?.id === sintoma.id}
                onClick={() => handleSeleccionarSintoma(sintoma)}
              >
                <ListItemText primary={sintoma.nombre} />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      
      {/* BOTÓN MENÚ (Solo se ve en móviles) */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: 10, 
            left: 10, 
            zIndex: 1100, 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* COMPONENTE DE NAVEGACIÓN (DRAWER) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Versión Móvil: Se oculta automáticamente al hacer clic fuera */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Versión Escritorio: Siempre visible */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 6, md: 0 }, // Espacio para no chocar con el botón hamburguesa
          overflowY: "auto"
        }}
      >
        <TextField
          fullWidth
          label="Buscar síntoma (ej: Fiebre, Migraña...)"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 3, bgcolor: 'white' }}
        />

        {/* Resultados de búsqueda flotantes */}
        {query && resultados.length > 0 && (
          <Card sx={{ 
            mb: 3, 
            zIndex: 10, 
            position: 'absolute', 
            width: { xs: '85%', md: '50%' } 
          }}>
            <CardContent sx={{ p: 0 }}>
              {resultados.map((r) => (
                <ListItemButton 
                  key={r.id} 
                  onClick={() => { handleSeleccionarSintoma(r); setQuery(""); }}
                >
                  <ListItemText primary={r.nombre} />
                </ListItemButton>
              ))}
            </CardContent>
          </Card>
        )}

        {sintomaActivo && (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                  {sintomaActivo.nombre}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {sintomaActivo.descripcionBreve}
                </Typography>

                {/* TRIAGE */}
                <Box sx={{ p: 2, bgcolor: '#fff5f5', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Preguntas de Triage:
                  </Typography>
                  {sintomaActivo.triage?.map((t, i) => (
                    <Typography key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: t.alertaSi ? "error.main" : "text.primary", fontSize: '0.9rem' }}>
                      • {t.pregunta} {t.alertaSi && <Chip label="DERIVAR" size="small" color="error" />}
                    </Typography>
                  ))}
                </Box>

                {/* CLAVES DE ATENCIÓN */}
                {sintomaActivo.clavesAtencion && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: "#e3f2fd", borderLeft: "6px solid #1976d2", borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1565c0", mb: 1 }}>
                      💡 CLAVES DE ATENCIÓN:
                    </Typography>
                    {sintomaActivo.clavesAtencion.map((clave, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {clave}</Typography>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* GRUPOS TERAPÉUTICOS */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Opciones Farmacológicas:
                </Typography>

                {sintomaActivo.gruposRecomendados?.map((recomendacion) => {
                  const infoGrupo = gruposInfo[recomendacion.id];
                  return (
                    <Card variant="outlined" key={recomendacion.id} sx={{ mb: 3, borderRadius: 2 }}>
                      <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderBottom: '1px solid #eee' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "primary.dark" }}>
                          {infoGrupo?.titulo}
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic", my: 1 }}>
                          "{infoGrupo?.explicacion}"
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Typography variant="caption" color="success.main"><strong>✓</strong> {infoGrupo?.pros}</Typography>
                          <Typography variant="caption" color="error.main"><strong>⚠</strong> {infoGrupo?.contras}</Typography>
                        </Stack>
                      </Box>

                      <CardContent>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                          {recomendacion.farmacosPrincipales.map((fId) => {
                            const fData = farmacosData.find((f) => f.id === fId);
                            return fData && (
                              <Button
                                key={fId}
                                variant="contained"
                                size="small"
                                onClick={() => navigate(`/farmacos/${fId}`)}
                                sx={{ textTransform: "none", borderRadius: 5 }}
                              >
                                {fData.nombre}
                              </Button>
                            );
                          })}
                        </Box>
                        {recomendacion.nota && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            * {recomendacion.nota}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* CRITERIOS DE DERIVACIÓN */}
                {sintomaActivo.criteriosDerivacion && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 4, color: 'error.main', fontWeight: 'bold' }}>
                      Derivar al médico si:
                    </Typography>
                    {sintomaActivo.criteriosDerivacion.map((d, i) => (
                      <Alert severity="error" variant="outlined" sx={{ mt: 1 }} key={i}>
                        {d}
                      </Alert>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};