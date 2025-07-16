// import React, { useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Menu,
//   MenuItem,
//   IconButton,
//   Drawer,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   useTheme,
//   useMediaQuery,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
// } from "@mui/material";
// import { Link } from "react-router-dom";
// import MenuIcon from "@mui/icons-material/Menu";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import SucursalSelector from "../SucursalSelector";

// export default function Navbar({
//   currentUser,
//   onToggleTheme,
//   mode,
//   onChangeUser,
// }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   // Menús desplegables para desktop
//   const [anchorElProd, setAnchorElProd] = useState(null);
//   const [anchorElLote, setAnchorElLote] = useState(null);
//   const [anchorElStock, setAnchorElStock] = useState(null);
//   const [anchorElUser, setAnchorElUser] = useState(null);
//   const [anchorElList, setAnchorElList] = useState(null);
//   const [anchorElUseful, setAnchorElUseful] = useState(null);
//   const [anchorElHelp, setAnchorElHelp] = useState(null);

//   const openUser = Boolean(anchorElUser);
//   // Drawer móvil
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // Funciones para abrir/ cerrar menús desktop
//   const openProd = Boolean(anchorElProd);
//   const openLote = Boolean(anchorElLote);
//   const openStock = Boolean(anchorElStock);
//   const openList = Boolean(anchorElList);

//   // Items de menú para usar en ambos casos (desktop y móvil)
//   const menuItems = [
//     {
//       label: "Productos",
//       submenu: [
//         { label: "Administrar productos", to: "/" },
//         { label: "Importar productos", to: "/products/import" },
//         // { label: "Precios", to: "/products/prices" },
//       ],
//     },
//     {
//       label: "Vencimientos",
//       submenu: [
//         { label: "Cargar vencimientos", to: "/lotes/cargar" },
//         { label: "Medicamentos por vencer", to: "/expiring" },
//       ],
//     },
//     {
//       label: "Stock",
//       submenu: [
//         { label: "Buscar stock en sucursales", to: "/stock-search" },
//         { label: "Ventas sin stock", to: "/stock/stockAnalysiss" },
//       ],
//     },

//     {
//       label: "Listas",
//       submenu: [
//         { label: "Listas de seguimientos de precio", to: "/lists" },
//         { label: "Listas de control de stock", to: "/stock-count" },
//         {
//           label: "Listas de devolución a droguerías",
//           to: "/lists/drug-returns",
//         },
//       ],
//     },

//     {
//       label: "Sucursales",
//       submenu: [{ label: "Ver sucursales", to: "/branches" }],
//     },
//     {
//       label: "Usuarios",
//       submenu: [
//         { label: "Crear usuario", to: "/users/create" },
//         // { label: "Listar usuarios", to: "/users" }, // opcional
//       ],
//     },
//     {
//       label: "Links Útiles",
//       submenu: [
//         { label: "Sucursales y teléfonos", to: "/contacts" },
//         // { label: "Validaciones y Droguerías", to: "/links/validaciones" },
//         // { label: "Web y Redes Sociales", to: "/links/web" },
//       ],
//     },
//     {
//       label: "Ayuda",
//       submenu: [{ label: "Guía de uso de la aplicación", to: "/help" }],
//     },
//   ];

//   return (
//     <>
//       <AppBar position="fixed" sx={{ backgroundColor: "#e67819" }}>
//         <Toolbar sx={{ justifyContent: "space-between" }}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Typography variant="h6">Gestión Farmacia</Typography>

//             {!isMobile && (
//               <>
//                 {/* Menús para escritorio */}
//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElProd(e.currentTarget)}
//                 >
//                   Productos
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElProd}
//                   open={openProd}
//                   onClose={() => setAnchorElProd(null)}
//                 >
//                   {menuItems[0].submenu.map(({ label, to }) => (
//                     <MenuItem
//                       component={Link}
//                       to={to}
//                       key={label}
//                       onClick={() => setAnchorElProd(null)}
//                     >
//                       {label}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElLote(e.currentTarget)}
//                 >
//                   Vencimientos
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElLote}
//                   open={openLote}
//                   onClose={() => setAnchorElLote(null)}
//                 >
//                   {menuItems[1].submenu.map(({ label, to }) => (
//                     <MenuItem
//                       component={Link}
//                       to={to}
//                       key={label}
//                       onClick={() => setAnchorElLote(null)}
//                     >
//                       {label}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElStock(e.currentTarget)}
//                 >
//                   Stock
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElStock}
//                   open={openStock}
//                   onClose={() => setAnchorElStock(null)}
//                 >
//                   {menuItems[2].submenu.map(({ label, to }) => (
//                     <MenuItem
//                       component={Link}
//                       to={to}
//                       key={label}
//                       onClick={() => setAnchorElStock(null)}
//                     >
//                       {label}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 {/* ✅ Nuevo menú para Listas */}
//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElList(e.currentTarget)}
//                 >
//                   Listas
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElList}
//                   open={openList}
//                   onClose={() => setAnchorElList(null)}
//                 >
//                   {menuItems[3].submenu.map(({ label, to }) => (
//                     <MenuItem
//                       component={Link}
//                       to={to}
//                       key={label}
//                       onClick={() => setAnchorElList(null)}
//                     >
//                       {label}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 <Button color="inherit" component={Link} to="/branches">
//                   Sucursales
//                 </Button>

//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElUser(e.currentTarget)}
//                 >
//                   Usuarios
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElUser}
//                   open={openUser}
//                   onClose={() => setAnchorElUser(null)}
//                 >
//                   {menuItems[4].submenu.map(({ label, to }) => (
//                     <MenuItem
//                       component={Link}
//                       to={to}
//                       key={label}
//                       onClick={() => setAnchorElUser(null)}
//                     >
//                       {label}
//                     </MenuItem>
//                   ))}
//                 </Menu>
//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElUseful(e.currentTarget)}
//                 >
//                   Links Útiles
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElUseful}
//                   open={Boolean(anchorElUseful)}
//                   onClose={() => setAnchorElUseful(null)}
//                 >
//                   {menuItems[6].submenu.map(
//                     ({ label, to }) => (
//                       <MenuItem
//                         component={Link}
//                         to={to}
//                         key={label}
//                         onClick={() => setAnchorElUseful(null)}
//                       >
//                         {label}
//                       </MenuItem>
//                     )
//                   )}
//                 </Menu>
//                 <Button
//                   color="inherit"
//                   onClick={(e) => setAnchorElHelp(e.currentTarget)}
//                 >
//                   Ayuda
//                 </Button>
//                 <Menu
//                   anchorEl={anchorElHelp}
//                   open={Boolean(anchorElHelp)}
//                   onClose={() => setAnchorElHelp(null)}
//                 >
//                   {menuItems[menuItems.length - 1].submenu.map(
//                     ({ label, to }) => (
//                       <MenuItem
//                         component={Link}
//                         to={to}
//                         key={label}
//                         onClick={() => setAnchorElHelp(null)}
//                       >
//                         {label}
//                       </MenuItem>
//                     )
//                   )}
//                 </Menu>
//               </>
//             )}
//           </Box>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <IconButton onClick={onToggleTheme} color="inherit">
//               {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
//             </IconButton>

//             {currentUser ? (
//               <>
//                 <Typography variant="body2">
//                   Hola {currentUser.username}
//                 </Typography>
//                 <Button color="inherit" onClick={onChangeUser}>
//                   Cambiar usuario
//                 </Button>
//               </>
//             ) : (
//               <Typography variant="body2">Iniciar sesión</Typography>
//             )}

//             {isMobile && (
//               <IconButton
//                 edge="end"
//                 color="inherit"
//                 aria-label="menu"
//                 onClick={() => setDrawerOpen(true)}
//               >
//                 <MenuIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Toolbar>
//         <Drawer
//           anchor="right"
//           open={drawerOpen}
//           onClose={() => setDrawerOpen(false)}
//         >
//           <Box
//             sx={{ width: 250 }}
//             role="presentation"
//             onClick={() => setDrawerOpen(false)}
//             onKeyDown={() => setDrawerOpen(false)}
//           >
//             <List>
//               {menuItems.map(({ label, submenu }) => (
//                 <Box key={label}>
//                   <ListItem>
//                     <ListItemText primary={label} />
//                   </ListItem>
//                   {submenu.map(({ label: subLabel, to }) => (
//                     <ListItem button component={Link} to={to} key={subLabel}>
//                       <ListItemText inset primary={`- ${subLabel}`} />
//                     </ListItem>
//                   ))}
//                 </Box>
//               ))}
//             </List>
//           </Box>
//         </Drawer>
//       </AppBar>

//       {/* Spacer para que el contenido no quede oculto debajo del navbar */}
//       <Toolbar />
//       <Drawer
//         anchor="right"
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//       >
//         <Box sx={{ width: 260, p: 2 }}>
//           {menuItems.map(({ label, submenu }) => (
//             <Accordion key={label}>
//               <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                 <Typography variant="subtitle1">{label}</Typography>
//               </AccordionSummary>
//               <AccordionDetails sx={{ p: 0 }}>
//                 <List dense>
//                   {submenu.map(({ label: subLabel, to }) => (
//                     <ListItem
//                       button
//                       component={Link}
//                       to={to}
//                       key={subLabel}
//                       onClick={() => setDrawerOpen(false)}
//                     >
//                       <ListItemText primary={subLabel} inset />
//                     </ListItem>
//                   ))}
//                 </List>
//               </AccordionDetails>
//             </Accordion>
//           ))}
//         </Box>
//       </Drawer>
//     </>
//   );
// }


import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Navbar({ currentUser, onToggleTheme, mode, onChangeUser }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorElProd, setAnchorElProd] = useState(null);
  const [anchorElLote, setAnchorElLote] = useState(null);
  const [anchorElStock, setAnchorElStock] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElList, setAnchorElList] = useState(null);
  const [anchorElUseful, setAnchorElUseful] = useState(null);
  const [anchorElHelp, setAnchorElHelp] = useState(null);

  const openProd = Boolean(anchorElProd);
  const openLote = Boolean(anchorElLote);
  const openStock = Boolean(anchorElStock);
  const openUser = Boolean(anchorElUser);
  const openList = Boolean(anchorElList);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    {
      label: "Productos",
      submenu: [
        { label: "Administrar productos", to: "/" },
        { label: "Importar productos", to: "/products/import" },
      ],
    },
    {
      label: "Vencimientos",
      submenu: [
        { label: "Cargar vencimientos", to: "/lotes/cargar" },
        { label: "Medicamentos por vencer", to: "/expiring" },
      ],
    },
    {
      label: "Stock",
      submenu: [
        { label: "Buscar stock en sucursales", to: "/stock-search" },
        { label: "Ventas sin stock", to: "/stock/stockAnalysiss" },
         { label: "Dashboard Inventario.", to: "/InventoryDashboard" },  
      ],
    },
    {
      label: "Listas",
      submenu: [
        {
          label: "Listas de seguimientos de precio",
          to: "/lists",
          submenu: [
            { label: "Etiquetas especiales", to: "/lists?tab=1" },
          ],
        },
        { label: "Listas de control de stock", to: "/stock-count" },
        { label: "Listas de devolución a droguerías", to: "/lists/drug-returns" },
      ],
    },
    {
      label: "Sucursales",
      submenu: [{ label: "Ver sucursales", to: "/branches" }],
    },
    {
      label: "Usuarios",
      submenu: [{ label: "Crear usuario", to: "/users/create" }],
    },
    {
      label: "Links Útiles",
      submenu: [{ label: "Sucursales y teléfonos", to: "/contacts" }],
    },
    {
      label: "Ayuda",
      submenu: [{ label: "Guía de uso de la aplicación", to: "/help" }],
    },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#e67819" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">Gestión Farmacia</Typography>

            {!isMobile && (
              <>
                <Button color="inherit" onClick={(e) => setAnchorElProd(e.currentTarget)}>Productos</Button>
                <Menu anchorEl={anchorElProd} open={openProd} onClose={() => setAnchorElProd(null)}>
                  {menuItems[0].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElProd(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" onClick={(e) => setAnchorElLote(e.currentTarget)}>Vencimientos</Button>
                <Menu anchorEl={anchorElLote} open={openLote} onClose={() => setAnchorElLote(null)}>
                  {menuItems[1].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElLote(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" onClick={(e) => setAnchorElStock(e.currentTarget)}>Stock</Button>
                <Menu anchorEl={anchorElStock} open={openStock} onClose={() => setAnchorElStock(null)}>
                  {menuItems[2].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElStock(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" onClick={(e) => setAnchorElList(e.currentTarget)}>Listas</Button>
                <Menu anchorEl={anchorElList} open={openList} onClose={() => setAnchorElList(null)}>
                  {menuItems[3].submenu.map((item) => (
                    <Box key={item.label}>
                      <MenuItem component={Link} to={item.to} onClick={() => setAnchorElList(null)}>
                        {item.label}
                      </MenuItem>
                      {item.submenu?.map((sub) => (
                        <MenuItem
                          key={sub.label}
                          component={Link}
                          to={sub.to}
                          onClick={() => setAnchorElList(null)}
                          sx={{ pl: 4 }}
                        >
                          • {sub.label}
                        </MenuItem>
                      ))}
                    </Box>
                  ))}
                </Menu>

                <Button color="inherit" component={Link} to="/branches">Sucursales</Button>

                <Button color="inherit" onClick={(e) => setAnchorElUser(e.currentTarget)}>Usuarios</Button>
                <Menu anchorEl={anchorElUser} open={openUser} onClose={() => setAnchorElUser(null)}>
                  {menuItems[5].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElUser(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" onClick={(e) => setAnchorElUseful(e.currentTarget)}>Links Útiles</Button>
                <Menu anchorEl={anchorElUseful} open={Boolean(anchorElUseful)} onClose={() => setAnchorElUseful(null)}>
                  {menuItems[6].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElUseful(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" onClick={(e) => setAnchorElHelp(e.currentTarget)}>Ayuda</Button>
                <Menu anchorEl={anchorElHelp} open={Boolean(anchorElHelp)} onClose={() => setAnchorElHelp(null)}>
                  {menuItems[7].submenu.map(({ label, to }) => (
                    <MenuItem component={Link} to={to} key={label} onClick={() => setAnchorElHelp(null)}>
                      {label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={onToggleTheme} color="inherit">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {currentUser ? (
              <>
                <Typography variant="body2">Hola {currentUser.username}</Typography>
                <Button color="inherit" onClick={onChangeUser}>Cambiar usuario</Button>
              </>
            ) : (
              <Typography variant="body2">Iniciar sesión</Typography>
            )}
            {isMobile && (
              <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          {menuItems.map(({ label, submenu }) => (
            <Accordion key={label}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{label}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {submenu.map((item) => (
                    <React.Fragment key={item.label}>
                      <ListItem
                        button
                        component={Link}
                        to={item.to}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemText primary={item.label} inset />
                      </ListItem>
                      {item.submenu?.map((sub) => (
                        <ListItem
                          key={sub.label}
                          button
                          component={Link}
                          to={sub.to}
                          onClick={() => setDrawerOpen(false)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemText primary={sub.label} inset />
                        </ListItem>
                      ))}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Drawer>
    </>
  );
}
