import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ProductLotsAccordion({
  product,
  isExpanded,
  onToggleExpand,
  lots = [],
  loadingLots,
  onEditProduct,
  onDeleteProduct,
  onAddLot,
  onEditLot,
  onDeleteLot,
}) {
  return (
    <Accordion expanded={isExpanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box>
            <Typography>{`${product.name} (${product.type})`}</Typography>
            <Typography variant="body2" color="text.secondary">
              Código: {product.barcode}
            </Typography>
          </Box>

          <Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct(product);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProduct(product._id);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {loadingLots ? (
          <Typography>Cargando lotes...</Typography>
        ) : (
          <>
            <Button
              startIcon={<AddIcon />}
              onClick={() => onAddLot(product)}
              sx={{ mb: 1 }}
              variant="outlined"
              size="small"
            >
              Agregar Lote
            </Button>

            {/* {lots.length > 0 ? (
              <List dense>
                {lots.map((lot) => (
                  <ListItem
                    key={lot._id}
                    secondaryAction={
                      <>
                        <IconButton
                          size="small"
                          onClick={() => onEditLot(lot)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteLot(lot)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={`Vence: ${new Date(
                        lot.expirationDate
                      ).toLocaleDateString()} - Cant: ${lot.quantity} - Sucursal: ${
                        lot.branch
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">
                No hay lotes para este producto.
              </Typography>
            )} */}

            {lots.length > 0 ? (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Vencimiento</TableCell>
        <TableCell>Cantidad</TableCell>
        <TableCell>Sucursal</TableCell>
        <TableCell>Creado por</TableCell>
        <TableCell align="right">Acciones</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {lots.map((lot) => (
        <TableRow key={lot._id}>
          <TableCell>
            {new Date(lot.expirationDate).toLocaleDateString()}
          </TableCell>
          <TableCell>{lot.quantity}</TableCell>
          <TableCell>{lot.branch}</TableCell>
          <TableCell>
            {lot.createdBy?.username || "N/A"}
          </TableCell>
          <TableCell align="right">
            <IconButton
              size="small"
              onClick={() => onEditLot(lot)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteLot(lot)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
) : (
  <Typography variant="body2">
    No hay lotes para este producto.
  </Typography>
)}

          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
