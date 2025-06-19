import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestión Farmacia
        </Typography>
        <Button color="inherit" component={Link} to="/productos">Productos</Button>
        <Button color="inherit" component={Link} to="/lotes">Lotes</Button>
        <Button color="inherit" component={Link} to="/vencimientos">Vencimientos</Button>
        {/* <Button color="inherit" component={Link} to="/escaneo">Escaneo</Button> */}
      </Toolbar>
    </AppBar>
  );
}
