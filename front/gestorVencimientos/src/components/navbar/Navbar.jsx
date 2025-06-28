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

export default function Navbar({ currentUser, onToggleTheme, mode,onChangeUser  }) {
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
      submenu: [{ label: "Administrar productos", to: "/" }],
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
      submenu: [{ label: "Buscar stock en sucursales", to: "/stock-search" }],
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
        {/* Menús para escritorio */}
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
  </Box>

  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <IconButton onClick={onToggleTheme} color="inherit">
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>

    {currentUser ? (
      <>
        <Typography variant="body2">Hola {currentUser.username}</Typography>
        <Button color="inherit" onClick={onChangeUser}>
          Cambiar usuario
        </Button>
      </>
    ) : (
      <Typography variant="body2">Iniciar sesión</Typography>
    )}

    {isMobile && (
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>
    )}
  </Box>
</Toolbar>

      </AppBar>
    
      {/* Spacer para que el contenido no quede oculto debajo del navbar */}
      <Toolbar />
    </>
  );
}
