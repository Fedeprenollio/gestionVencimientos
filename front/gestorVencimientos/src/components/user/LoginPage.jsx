import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import axios from "axios";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Paper sx={{ p: 3, width: 300 }}>
        <Typography variant="h6" gutterBottom>
          Iniciar sesión
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth>
            Ingresar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
