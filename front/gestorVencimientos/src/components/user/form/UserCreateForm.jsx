// components/users/UserCreateForm.jsx
import React from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Esquema de validación
const schema = yup.object({
  username: yup.string().required("El nombre de usuario es obligatorio"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(6, "Mínimo 6 caracteres"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmá tu contraseña"),
  role: yup.string().oneOf(["admin", "user"]).required("Selecciona un rol"),
});

export default function UserCreateForm({ onSubmit }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
    },
  });

  const submit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submit)}
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h6" gutterBottom>
        Crear nuevo usuario
      </Typography>

      {/* Username */}
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Usuario"
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        )}
      />

      {/* Password */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirmar contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />

      {/* Role */}
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel>Rol</InputLabel>
            <Select {...field} label="Rol">
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="user">Usuario</MenuItem>
            </Select>
            <FormHelperText>{errors.role?.message}</FormHelperText>
          </FormControl>
        )}
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Crear usuario
      </Button>
    </Box>
  );
}
