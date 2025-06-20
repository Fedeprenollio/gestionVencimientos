import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ExpiringProductFilter from "./ExpiringProductFilter";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import {
  exportToExcel,
  exportToPDF,
  formatDate,
  formatDateWhitDay,
} from "../../../utils/exportUtils";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
} from "@mui/material";

export default function ExpiringProductList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("expiration");
  const [order, setOrder] = useState("asc");
  const [quickFilters, setQuickFilters] = useState({
    productName: "",
    type: "",
    branch: "",
  });
console.log("products",products)
  const fetchProducts = async (filterParams = {}) => {
    const params = new URLSearchParams();

    if (filterParams.from) params.append("from", filterParams.from);
    if (filterParams.months) params.append("months", filterParams.months);
    if (filterParams.branch) params.append("branch", filterParams.branch);
    if (filterParams.type) params.append("type", filterParams.type);
    if (filterParams.createdFrom)
      params.append("createdFrom", filterParams.createdFrom);
    if (filterParams.createdTo)
      params.append("createdTo", filterParams.createdTo);

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/products?${params}`
    );
    setProducts(res.data);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const deleteLot = async (productId, lotId) => {
    if (!confirm("¿Eliminar este lote?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}/lots/${lotId}`
      );
      fetchProducts(filters); // mantener filtros activos
    } catch (err) {
      alert("Error al eliminar el lote");
      console.error(err);
    }
  };

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  const rows = useMemo(() => {
    let flat = [];
    products.forEach((prod) => {
      prod.lots.forEach((lot) => {
        flat.push({
          productName: prod.name,
          type: prod.type,
          branch: lot.branch,
          quantity: lot.quantity,
          expirationDate: new Date(lot.expirationDate),
          createdAt: new Date(lot.createdAt),
          productId: prod._id,
          lotId: lot._id,
        });
      });
    });

    // Filtros rápidos
    flat = flat.filter((row) => {
      return (
        row.productName.toLowerCase().includes(quickFilters.productName.toLowerCase()) &&
        row.type.toLowerCase().includes(quickFilters.type.toLowerCase()) &&
        row.branch.toLowerCase().includes(quickFilters.branch.toLowerCase())
      );
    });

    // Orden
    // flat.sort((a, b) => {
    //   let comp = 0;
    //   switch (sortBy) {
    //     case "productName":
    //       comp = a.productName.localeCompare(b.productName);
    //       break;
    //     case "type":
    //       comp = a.type.localeCompare(b.type);
    //       break;
    //     case "branch":
    //       comp = a.branch.localeCompare(b.branch);
    //       break;
    //     case "quantity":
    //       comp = a.quantity - b.quantity;
    //       break;
    //     case "expiration":
    //       comp = a.expirationDate - b.expirationDate;
    //       break;
    //     case "created":
    //       comp = a.createdAt - b.createdAt;
    //       break;
    //     default:
    //       comp = 0;
    //   }
    //   return order === "asc" ? comp : -comp;
    // });
    flat.sort((a, b) => {
      let comp = 0;
    
      switch (sortBy) {
        case "productName":
          comp = a.productName.localeCompare(b.productName);
          if (comp === 0) comp = a.expirationDate - b.expirationDate;
          break;
        case "type":
          comp = a.type.localeCompare(b.type);
          if (comp === 0) comp = a.expirationDate - b.expirationDate;
          break;
        case "branch":
          comp = a.branch.localeCompare(b.branch);
          if (comp === 0) comp = a.expirationDate - b.expirationDate;
          break;
        case "quantity":
          comp = a.quantity - b.quantity;
          break;
        case "expiration":
          comp = a.expirationDate - b.expirationDate;
          break;
        case "created":
          comp = a.createdAt - b.createdAt;
          break;
        default:
          comp = 0;
      }
    
      return order === "asc" ? comp : -comp;
    });
    

    return flat;
  }, [products, sortBy, order, quickFilters]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  const handleExportPDF = () => {
    exportToPDF(products, sortBy);
  };

  return (
    <Box>
      <ExpiringProductFilter onFilter={handleFilter} />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* <FormControl>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            size="small"
            label="Ordenar por"
          >
            <MenuItem value="expiration">Vencimiento</MenuItem>
            <MenuItem value="productName">Nombre</MenuItem>
            <MenuItem value="quantity">Cantidad</MenuItem>
            <MenuItem value="created">Creado</MenuItem>
            <MenuItem value="type">Tipo</MenuItem>
            <MenuItem value="branch">Sucursal</MenuItem>
          </Select>
        </FormControl>
        <Button onClick={handleExportPDF} variant="contained" color="primary">
          Exportar PDF
        </Button> */}
        <Button onClick={() => exportToExcel(products)}>Exportar Excel</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {[
                { id: "productName", label: "Producto" },
                { id: "type", label: "Tipo" },
                { id: "branch", label: "Sucursal" },
                { id: "quantity", label: "Cantidad" },
                { id: "expiration", label: "Vencimiento" },
                { id: "created", label: "Creado" },
                { id: "actions", label: "" },
              ].map((col) => (
                <TableCell key={col.id}>
                  {col.id !== "actions" ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : null}
                </TableCell>
              ))}
            </TableRow>
            {/* Fila de filtros rápidos */}
            <TableRow>
              <TableCell>
                <TextField
                  value={quickFilters.productName}
                  onChange={(e) =>
                    setQuickFilters((f) => ({
                      ...f,
                      productName: e.target.value,
                    }))
                  }
                  size="small"
                  placeholder="Buscar"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={quickFilters.type}
                  onChange={(e) =>
                    setQuickFilters((f) => ({ ...f, type: e.target.value }))
                  }
                  size="small"
                  placeholder="Tipo"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={quickFilters.branch}
                  onChange={(e) =>
                    setQuickFilters((f) => ({ ...f, branch: e.target.value }))
                  }
                  size="small"
                  placeholder="Sucursal"
                />
              </TableCell>
              <TableCell colSpan={4} />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.productId}-${row.lotId}`}>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.branch}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>
                  {formatDate(row.expirationDate.toISOString())}
                </TableCell>
                <TableCell>
                  {formatDateWhitDay(row.createdAt.toISOString())}
                </TableCell>
                <TableCell>
                  <Tooltip title="Eliminar lote">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteLot(row.productId, row.lotId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
