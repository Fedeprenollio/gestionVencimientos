import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import SucursalSelector from "../SucursalSelector";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
        username,
        password,
      });
      onLogin(res.data);
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Box sx={{ pb: 2, mt: 4, width: "100%" }}>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : "#2c2c2c",
          borderRadius: 2,
          width: "100%",
          maxWidth: "70%",
          mx: "auto", // Centrado horizontal (opcional: podés quitarlo si no querés centrado)
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6">Iniciar sesión</Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
            <TextField
              label="Usuario"
              size="small"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
                
                
                
              <SucursalSelector/>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth size="small">
            Ingresar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
