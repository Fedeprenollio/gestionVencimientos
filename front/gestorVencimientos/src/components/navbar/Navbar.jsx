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

export default function Navbar({
  currentUser,
  onToggleTheme,
  mode,
  onChangeUser,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Menús desplegables para desktop
  const [anchorElProd, setAnchorElProd] = useState(null);
  const [anchorElLote, setAnchorElLote] = useState(null);
  const [anchorElStock, setAnchorElStock] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElList, setAnchorElList] = useState(null);

  const openUser = Boolean(anchorElUser);
  // Drawer móvil
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Funciones para abrir/ cerrar menús desktop
  const openProd = Boolean(anchorElProd);
  const openLote = Boolean(anchorElLote);
  const openStock = Boolean(anchorElStock);
  const openList = Boolean(anchorElList);

  // Items de menú para usar en ambos casos (desktop y móvil)
  const menuItems = [
    {
      label: "Productos",
      submenu: [
        { label: "Administrar productos", to: "/" },
        { label: "Importar productos", to: "/products/import" },
        // { label: "Precios", to: "/products/prices" },
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
      submenu: [{ label: "Buscar stock en sucursales", to: "/stock-search" },
        { label: "Ventas sin stock", to: "/stock/stockAnalysiss" }
      ],
    },
  
    {
      label: "Listas",
      submenu: [
        { label: "Listas de cambio de precio", to: "/lists" },
        { label: "Listas de control de stock", to: "/stock-count" },
        {
          label: "Listas de devolución a droguerías",
          to: "/lists/drug-returns",
        },
      ],
    },

    {
      label: "Sucursales",
      submenu: [{ label: "Ver sucursales", to: "/branches" }],
    },
    {
      label: "Usuarios",
      submenu: [
        { label: "Crear usuario", to: "/users/create" },
        // { label: "Listar usuarios", to: "/users" }, // opcional
      ],
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

                {/* ✅ Nuevo menú para Listas */}
                <Button
                  color="inherit"
                  onClick={(e) => setAnchorElList(e.currentTarget)}
                >
                  Listas
                </Button>
                <Menu
                  anchorEl={anchorElList}
                  open={openList}
                  onClose={() => setAnchorElList(null)}
                >
                  {menuItems[3].submenu.map(({ label, to }) => (
                    <MenuItem
                      component={Link}
                      to={to}
                      key={label}
                      onClick={() => setAnchorElList(null)}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                <Button color="inherit" component={Link} to="/branches">
                  Sucursales
                </Button>

                <Button
                  color="inherit"
                  onClick={(e) => setAnchorElUser(e.currentTarget)}
                >
                  Usuarios
                </Button>
                <Menu
                  anchorEl={anchorElUser}
                  open={openUser}
                  onClose={() => setAnchorElUser(null)}
                >
                  {menuItems[4].submenu.map(({ label, to }) => (
                    <MenuItem
                      component={Link}
                      to={to}
                      key={label}
                      onClick={() => setAnchorElUser(null)}
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
                <Typography variant="body2">
                  Hola {currentUser.username}
                </Typography>
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
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={() => setDrawerOpen(false)}
            onKeyDown={() => setDrawerOpen(false)}
          >
            <List>
              {menuItems.map(({ label, submenu }) => (
                <Box key={label}>
                  <ListItem>
                    <ListItemText primary={label} />
                  </ListItem>
                  {submenu.map(({ label: subLabel, to }) => (
                    <ListItem button component={Link} to={to} key={subLabel}>
                      <ListItemText inset primary={`- ${subLabel}`} />
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          </Box>
        </Drawer>
      </AppBar>

      {/* Spacer para que el contenido no quede oculto debajo del navbar */}
      <Toolbar />
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260, p: 2 }}>
          {menuItems.map(({ label, submenu }) => (
            <Accordion key={label}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{label}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {submenu.map(({ label: subLabel, to }) => (
                    <ListItem
                      button
                      component={Link}
                      to={to}
                      key={subLabel}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <ListItemText primary={subLabel} inset />
                    </ListItem>
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
