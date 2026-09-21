import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import LotEditModal from "./LotEditModal";
import {  exportToExcelLots } from "../../../utils/exportUtils";

export default function CreatedLotsTable({ createdLots, onClear, onUpdate }) {
  const [editingLot, setEditingLot] = useState(null);

  const getProduct = (lot) => {
    if (lot.productId && typeof lot.productId === "object") {
      return lot.productId;
    }

    if (lot.product && typeof lot.product === "object") {
      return lot.product;
    }

    return null;
  };

  const getBranchName = (lot) => {
    if (!lot.branch) return "-";

    if (typeof lot.branch === "object") {
      return lot.branch.name || "-";
    }

    return lot.branch;
  };

  const getUsername = (lot) => {
    if (!lot.createdBy) return "?";

    if (typeof lot.createdBy === "object") {
      return (
        lot.createdBy.username ||
        lot.createdBy.fullname ||
        "?"
      );
    }

    return lot.createdBy;
  };

  const handleDelete = async (lotId) => {
    const confirmDelete = confirm("¿Eliminar este lote de la lista?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/lots/${lotId}`
      );

      const updated = createdLots.filter(
        (lot) => lot._id !== lotId
      );

      onUpdate(updated);

      alert("Lote eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar el lote:", err);
      alert("Error al eliminar el lote");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/lots/${editingLot._id}`,
        editingLot
      );

      const updatedLot = res.data.lot;

      const updated = createdLots.map((lot) =>
        lot._id === updatedLot._id ? updatedLot : lot
      );

      onUpdate(updated);
      setEditingLot(null);

      alert("Lote actualizado con éxito");
    } catch (err) {
      console.error("Error al actualizar el lote:", err);
      alert("Error al actualizar el lote");
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        px: { xs: 1, sm: 2 },
        maxWidth: "1200px",
        mx: "auto",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">
          Lotes creados
        </Typography>

        <Button color="error" onClick={onClear}>
          Limpiar todos
        </Button>
      </Box>

      <Box sx={{ overflowX: { xs: "auto", sm: "visible" } }}>
        <Table size="small" sx={{ minWidth: "600px" }}>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Sucursal</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>N° de Serie</TableCell>
              <TableCell>Sobrestock</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {createdLots.map((lot) => {
              const product = getProduct(lot);

              return (
                <TableRow key={lot._id}>
                  <TableCell>
                    {product?.name || "-"}
                  </TableCell>

                  <TableCell>
                    {product?.barcode || "-"}
                  </TableCell>

                  <TableCell>
                    {product?.type || "-"}
                  </TableCell>

                  <TableCell>
                    {lot.quantity ?? 0}
                  </TableCell>

                  <TableCell>
                    {getBranchName(lot)}
                  </TableCell>

                  <TableCell>
                    {lot.expirationDate
                      ? dayjs(lot.expirationDate).format("MM/YYYY")
                      : "-"}
                  </TableCell>

                  <TableCell>
                    {lot.batchNumber || "-"}
                  </TableCell>

                  <TableCell>
                    {lot.serialNumber || "-"}
                  </TableCell>

                  <TableCell>
                    {lot.overstock ? "Sí" : "No"}
                  </TableCell>

                  <TableCell>
                    {getUsername(lot)}
                  </TableCell>

                  <TableCell>
                    <IconButton
                      onClick={() =>
                        setEditingLot({ ...lot })
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        handleDelete(lot._id)
                      }
                    >
                      <DeleteIcon
                        fontSize="small"
                        color="error"
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <LotEditModal
        open={!!editingLot}
        lot={editingLot}
        onChange={setEditingLot}
        onClose={() => setEditingLot(null)}
        onSave={handleSaveEdit}
      />

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => exportToExcelLots(createdLots)}
        >
          Exportar a Excel
        </Button>
      </Box>
    </Box>
  );
}