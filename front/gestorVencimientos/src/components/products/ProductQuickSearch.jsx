import { Box, TextField, Button, Typography } from "@mui/material";

export default function ProductQuickSearch({ query, setQuery, onSearch }) {
  return (
    <Box>
        <Typography variant="h6" gutterBottom>
            Busqueda Rapida de Productos
          </Typography>
      <TextField
        fullWidth
        placeholder="Buscar por nombre o código"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="contained" onClick={onSearch}>
        Buscar
      </Button>
    </Box>
  );
}
