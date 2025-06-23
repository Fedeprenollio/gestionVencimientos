import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Navbar({onToggleTheme,mode}) {
  const [anchorElProd, setAnchorElProd] = useState(null);
  const [anchorElLote, setAnchorElLote] = useState(null);
  const [anchorElStock, setAnchorElStock] = useState(null);

  const openProd = Boolean(anchorElProd);
  const openLote = Boolean(anchorElLote);
  const openStock = Boolean(anchorElStock);

  return (
    <AppBar >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestión Farmacia
        </Typography>

         <IconButton onClick={onToggleTheme} color="inherit">
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

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
          <MenuItem component={Link} to="/" onClick={() => setAnchorElProd(null)}>
            Administrar productos
          </MenuItem>
        </Menu>

        {/* Lotes */}
        <Button
          color="inherit"
          onClick={(e) => setAnchorElLote(e.currentTarget)}
        >
          Lotes
        </Button>
        <Menu
          anchorEl={anchorElLote}
          open={openLote}
          onClose={() => setAnchorElLote(null)}
        >
          <MenuItem component={Link} to="/lotes/cargar" onClick={() => setAnchorElLote(null)}>
            Cargar vencimientos
          </MenuItem>
          <MenuItem component={Link} to="/lots/manage" onClick={() => setAnchorElLote(null)}>
            Administrar lotes
          </MenuItem>
          <MenuItem component={Link} to="/expiring" onClick={() => setAnchorElLote(null)}>
            Lotes por vencer
          </MenuItem>
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
          <MenuItem component={Link} to="/stock-search" onClick={() => setAnchorElStock(null)}>
            Buscar stock en sucursales
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
