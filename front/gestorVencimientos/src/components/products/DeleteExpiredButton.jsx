import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function DeleteExpiredButton({ onDeleted }) {
  const handleClick = async () => {
    if (!confirm("¿Estás seguro de eliminar los lotes vencidos?")) return;

    try {
      await axios.delete(import.meta.env.VITE_API_URL + '/products/expired-lots');
      alert("Lotes vencidos eliminados");
      onDeleted?.();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  return (
    <Button
      variant="contained"
      color="error"
      startIcon={<DeleteIcon />}
      onClick={handleClick}
    >
      Eliminar lotes vencidos
    </Button>
  );
}
