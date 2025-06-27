// import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from "@mui/material";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";

// export default function Navbar({onToggleTheme,mode}) {
//   const [anchorElProd, setAnchorElProd] = useState(null);
//   const [anchorElLote, setAnchorElLote] = useState(null);
//   const [anchorElStock, setAnchorElStock] = useState(null);

//   const openProd = Boolean(anchorElProd);
//   const openLote = Boolean(anchorElLote);
//   const openStock = Boolean(anchorElStock);

//   return (
//     <AppBar >
//       <Toolbar>
//         <Typography variant="h6" sx={{ flexGrow: 1 }}>
//           Gestión Farmacia
//         </Typography>

//          <IconButton onClick={onToggleTheme} color="inherit">
//         {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
//       </IconButton>

//         {/* Productos */}
//         <Button
//           color="inherit"
//           onClick={(e) => setAnchorElProd(e.currentTarget)}
//         >
//           Productos
//         </Button>
//         <Menu
//           anchorEl={anchorElProd}
//           open={openProd}
//           onClose={() => setAnchorElProd(null)}
//         >
//           <MenuItem component={Link} to="/" onClick={() => setAnchorElProd(null)}>
//             Administrar productos
//           </MenuItem>
//         </Menu>

//         {/* Lotes */}
//         <Button
//           color="inherit"
//           onClick={(e) => setAnchorElLote(e.currentTarget)}
//         >
//           Vencimientos
//         </Button>
//         <Menu
//           anchorEl={anchorElLote}
//           open={openLote}
//           onClose={() => setAnchorElLote(null)}
//         >
//           <MenuItem component={Link} to="/lotes/cargar" onClick={() => setAnchorElLote(null)}>
//             Cargar vencimientos
//           </MenuItem>
//           {/* <MenuItem component={Link} to="/lots/manage" onClick={() => setAnchorElLote(null)}>
//             Administrar lotes
//           </MenuItem> */}
//           <MenuItem component={Link} to="/expiring" onClick={() => setAnchorElLote(null)}>
//             Medicamentos por vencer
//           </MenuItem>
//         </Menu>

//         {/* Stock */}
//         <Button
//           color="inherit"
//           onClick={(e) => setAnchorElStock(e.currentTarget)}
//         >
//           Stock
//         </Button>
//         <Menu
//           anchorEl={anchorElStock}
//           open={openStock}
//           onClose={() => setAnchorElStock(null)}
//         >
//           <MenuItem component={Link} to="/stock-search" onClick={() => setAnchorElStock(null)}>
//             Buscar stock en sucursales
//           </MenuItem>
//         </Menu>
//       </Toolbar>
//     </AppBar>
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
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Navbar({ onToggleTheme, mode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Menús desplegables para desktop
  const [anchorElProd, setAnchorElProd] = useState(null);
  const [anchorElLote, setAnchorElLote] = useState(null);
  const [anchorElStock, setAnchorElStock] = useState(null);

  // Drawer móvil
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Funciones para abrir/ cerrar menús desktop
  const openProd = Boolean(anchorElProd);
  const openLote = Boolean(anchorElLote);
  const openStock = Boolean(anchorElStock);

  // Items de menú para usar en ambos casos (desktop y móvil)
  const menuItems = [
    {
      label: "Productos",
      submenu: [
        { label: "Administrar productos", to: "/" },
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
      ],
    },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#e67819" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestión Farmacia
          </Typography>

          <IconButton onClick={onToggleTheme} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {isMobile ? (
            <>
              {/* Botón hamburguesa para abrir drawer */}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>

              {/* Drawer lateral para móvil */}
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)} onKeyDown={() => setDrawerOpen(false)}>
                  <List>
                    {menuItems.map(({ label, submenu }) => (
                      <React.Fragment key={label}>
                        <ListItem>
                          <ListItemText primary={label} />
                        </ListItem>
                        {submenu.map(({ label: subLabel, to }) => (
                          <ListItem
                            button
                            key={subLabel}
                            component={Link}
                            to={to}
                          >
                            <ListItemText sx={{ pl: 3 }} primary={subLabel} />
                          </ListItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              {/* Menús desplegables para desktop */}
              {/* Productos */}
              <Button
                color="inherit"
                onClick={(e) => setAnchorElProd(e.currentTarget)}
              >
                Productos
              </Button>
              <Menu
                anchorEl={anchorElProd}
                open={openProd}
                onClose={() => setAnchorElProd(null)}
              >
                {menuItems[0].submenu.map(({ label, to }) => (
                  <MenuItem
                    component={Link}
                    to={to}
                    key={label}
                    onClick={() => setAnchorElProd(null)}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Menu>

              {/* Vencimientos */}
              <Button
                color="inherit"
                onClick={(e) => setAnchorElLote(e.currentTarget)}
              >
                Vencimientos
              </Button>
              <Menu
                anchorEl={anchorElLote}
                open={openLote}
                onClose={() => setAnchorElLote(null)}
              >
                {menuItems[1].submenu.map(({ label, to }) => (
                  <MenuItem
                    component={Link}
                    to={to}
                    key={label}
                    onClick={() => setAnchorElLote(null)}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Menu>

              {/* Stock */}
              <Button
                color="inherit"
                onClick={(e) => setAnchorElStock(e.currentTarget)}
              >
                Stock
              </Button>
              <Menu
                anchorEl={anchorElStock}
                open={openStock}
                onClose={() => setAnchorElStock(null)}
              >
                {menuItems[2].submenu.map(({ label, to }) => (
                  <MenuItem
                    component={Link}
                    to={to}
                    key={label}
                    onClick={() => setAnchorElStock(null)}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Spacer para que el contenido no quede oculto debajo del navbar */}
      <Toolbar />
    </>
  );
}

