    import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

export default function HelpDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>¿Qué significan los indicadores de inventario?</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          📦 Días de Inventario (DSI)
        </Typography>
        <Typography paragraph>
          <strong>Qué indica:</strong><br />
          El DSI estima cuántos días durará tu stock actual si se mantiene el ritmo de ventas que tuviste en el último año.
        </Typography>
        <Typography paragraph>
          <strong>Cómo se calcula:</strong><br />
          Para cada producto: <br />
          <code>DSI = Stock actual ÷ (Ventas anuales ÷ 365)</code><br />
          Si el producto no tuvo ventas en el período analizado, el DSI será infinito (∞), lo que puede indicar que está en desuso o mal cargado.
        </Typography>
        <Typography paragraph>
          <strong>Cómo interpretarlo:</strong><br />
          🔴 Alto (más de 180 días o ∞): tenés más stock del que necesitás. Riesgo de vencimiento o pérdida.<br />
          🟡 Medio (61 a 180 días): stock aceptable, pero conviene revisar.<br />
          🟢 Bajo (60 días o menos): buena rotación, stock saludable.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          💸 Pérdidas proyectadas por vencimiento
        </Typography>
        <Typography paragraph>
          <strong>Qué indica:</strong><br />
          Estima cuánto dinero podrías perder si los productos con sobrestock (DSI muy alto) no se venden antes de vencerse o deteriorarse.
        </Typography>
        <Typography paragraph>
          <strong>Cómo se calcula:</strong><br />
          Para productos con <code>DSI &gt; 180</code> o infinito:<br />
          <code>Pérdida = Stock actual × Costo unitario</code><br />
          La suma de estas pérdidas estimadas se muestra como una alerta para tomar decisiones de descuento, devolución o promoción.
        </Typography>
        <Typography paragraph>
          <strong>Requiere:</strong><br />
          Que el stock tenga cargado un campo de costo. Si no hay costo, la pérdida estimada será $0.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          🧰 Filtros disponibles
        </Typography>
        <Typography paragraph>
          <strong>Excluir productos con stock negativo:</strong> Elimina productos con stock menor a cero (posible error de carga).
        </Typography>
        <Typography paragraph>
          <strong>Excluir productos sin ventas:</strong> Descarta productos que no tuvieron ventas durante el año analizado.
        </Typography>
        <Typography paragraph>
          <strong>Excluir productos sin stock:</strong> No considera productos que tienen ventas pero sin stock actual.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
