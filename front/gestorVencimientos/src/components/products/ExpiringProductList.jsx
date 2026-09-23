import { useEffect, useState, useMemo } from "react";
import axios from "axios";

import ExpiringProductFilter from "./ExpiringProductFilter";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
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
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Paper,
  FormControl,
  InputLabel,
} from "@mui/material";

import useSnackbar from "../../hooks/useSnackbar";
import AppSnackbar from "../shared/AppSnackbar";
import useLoading from "../../hooks/useLoading";
import FullPageLoader from "../shared/FullPageLoader";

export default function ExpiringProductList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("expiration");
  const [order, setOrder] = useState("asc");

  const [quickFilters, setQuickFilters] = useState({
    productName: "",
    barcode: "",
    branch: "",
    createdBy: "",
    expirationList: "",
  });

  const { loading, withLoading } = useLoading();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const fetchProducts = async (filterParams = {}) => {
    const params = new URLSearchParams();

    if (filterParams.from) {
      params.append("from", filterParams.from);
    }

    if (filterParams.months) {
      params.append("months", filterParams.months);
    }

    if (filterParams.branch) {
      params.append("branch", filterParams.branch);
    }

    if (filterParams.createdBy) {
      params.append("createdBy", filterParams.createdBy);
    }

    if (filterParams.createdFrom) {
      params.append("createdFrom", filterParams.createdFrom);
    }

    if (filterParams.createdTo) {
      params.append("createdTo", filterParams.createdTo);
    }

    if (filterParams.overstock) {
      params.append("overstock", filterParams.overstock);
    }

    if (filterParams.barcodes) {
      params.append("barcodes", filterParams.barcodes);
    }

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/products?${params}`
    );

    console.log("RES:DATA", res.data);

    setProducts(res.data);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);

    withLoading(() => fetchProducts(newFilters));
  };

  const deleteLot = async (productId, lotId) => {
    if (!confirm("¿Eliminar este lote?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/lots/${lotId}`
      );

      fetchProducts(filters);

      showSnackbar(
        "Lote eliminado correctamente",
        "success"
      );
    } catch (err) {
      console.error(err);

      showSnackbar(
        "Error al eliminar el lote",
        "error"
      );
    }
  };

  /*
   * Obtiene el nombre de las listas del lote.
   *
   * Si el lote no tiene ninguna lista:
   * "Sin lista"
   */
  const getExpirationListNames = (lot) => {
    if (
      !lot.expirationLists ||
      !Array.isArray(lot.expirationLists) ||
      lot.expirationLists.length === 0
    ) {
      return ["Sin lista"];
    }

    return lot.expirationLists
      .map((list) => {
        if (typeof list === "object") {
          return list.name;
        }

        return list;
      })
      .filter(Boolean);
  };

  /*
   * Aplanamos los productos y lotes.
   */
  const rows = useMemo(() => {
    let flat = [];

    products.forEach((prod) => {
      if (!prod.lots || !Array.isArray(prod.lots)) {
        return;
      }

      prod.lots.forEach((lot) => {
        const expirationLists =
          getExpirationListNames(lot);

        flat.push({
          productName: prod.name || "",
          barcode: prod.barcode || "",

          createdBy:
            lot.createdBy?.username || "",

          branch:
            typeof lot.branch === "object"
              ? lot.branch?.name
              : lot.branch,

          quantity: lot.quantity,

          expirationDate: new Date(
            lot.expirationDate
          ),

          createdAt: new Date(
            lot.createdAt
          ),

          productId: prod._id,
          lotId: lot._id,

          overstock: lot.overstock || false,

          batchNumber:
            lot.batchNumber || "",

          serialNumber:
            lot.serialNumber || "",

          /*
           * Guardamos los nombres como array
           * para poder filtrar correctamente.
           */
          expirationLists,
        });
      });
    });

    /*
     * Filtros rápidos
     */
    flat = flat.filter((row) => {
      const matchesProduct =
        row.productName
          .toLowerCase()
          .includes(
            quickFilters.productName.toLowerCase()
          );

      const matchesBarcode =
        row.barcode
          .toLowerCase()
          .includes(
            quickFilters.barcode?.toLowerCase() || ""
          );

      const matchesCreatedBy =
        row.createdBy
          .toLowerCase()
          .includes(
            quickFilters.createdBy?.toLowerCase() || ""
          );

      const matchesBranch =
        (row.branch || "")
          .toLowerCase()
          .includes(
            (quickFilters.branch || "").toLowerCase()
          );

      /*
       * Filtro por lista
       *
       * Si está vacío = todas.
       */
      const matchesExpirationList =
        !quickFilters.expirationList ||
        row.expirationLists.includes(
          quickFilters.expirationList
        );

      return (
        matchesProduct &&
        matchesBarcode &&
        matchesCreatedBy &&
        matchesBranch &&
        matchesExpirationList
      );
    });

    /*
     * Ordenamiento
     */
    flat.sort((a, b) => {
      let comp = 0;

      switch (sortBy) {
        case "productName":
          comp = a.productName.localeCompare(
            b.productName
          );

          if (comp === 0) {
            comp =
              a.expirationDate -
              b.expirationDate;
          }

          break;

        case "branch":
          comp = (a.branch || "").localeCompare(
            b.branch || ""
          );

          if (comp === 0) {
            comp =
              a.expirationDate -
              b.expirationDate;
          }

          break;

        case "quantity":
          comp = a.quantity - b.quantity;
          break;

        case "expiration":
          comp =
            a.expirationDate -
            b.expirationDate;
          break;

        case "created":
          comp =
            a.createdAt -
            b.createdAt;
          break;

        case "overstock":
          comp =
            a.overstock === b.overstock
              ? 0
              : a.overstock
              ? -1
              : 1;
          break;

        case "expirationList":
          comp = a.expirationLists
            .join(", ")
            .localeCompare(
              b.expirationLists.join(", ")
            );
          break;

        default:
          comp = 0;
      }

      return order === "asc"
        ? comp
        : -comp;
    });

    return flat;
  }, [
    products,
    sortBy,
    order,
    quickFilters,
  ]);

  /*
   * Lista de nombres disponibles para el filtro.
   */
  const expirationListOptions = useMemo(() => {
    const names = new Set();

    products.forEach((prod) => {
      if (!prod.lots || !Array.isArray(prod.lots)) {
        return;
      }

      prod.lots.forEach((lot) => {
        const lists =
          getExpirationListNames(lot);

        lists.forEach((name) => {
          if (name) {
            names.add(name);
          }
        });
      });
    });

    return Array.from(names).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder(
        order === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  return (
    <Box>
      <ExpiringProductFilter
        onFilter={handleFilter}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          onClick={() =>
            exportToExcel(products)
          }
        >
          Exportar Excel
        </Button>
      </Box>

      {loading && <FullPageLoader />}

      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              {[
                {
                  id: "productName",
                  label: "Producto",
                },
                {
                  id: "barcode",
                  label: "Código de barras",
                },
                {
                  id: "createdBy",
                  label: "Creado por",
                },
                {
                  id: "branch",
                  label: "Sucursal",
                },
                {
                  id: "expirationList",
                  label: "Lista",
                },
                {
                  id: "quantity",
                  label: "Cantidad",
                },
                {
                  id: "expiration",
                  label: "Vencimiento",
                },
                {
                  id: "created",
                  label: "Creado",
                },
                {
                  id: "overstock",
                  label: "SobreStock",
                },
                {
                  id: "actions",
                  label: "",
                },
              ].map((col) => (
                <TableCell key={col.id}>
                  {col.id !== "actions" ? (
                    <TableSortLabel
                      active={
                        sortBy === col.id
                      }
                      direction={
                        sortBy === col.id
                          ? order
                          : "asc"
                      }
                      onClick={() =>
                        handleSort(col.id)
                      }
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
                  value={
                    quickFilters.productName
                  }
                  onChange={(e) =>
                    setQuickFilters(
                      (f) => ({
                        ...f,
                        productName:
                          e.target.value,
                      })
                    )
                  }
                  size="small"
                  placeholder="Buscar"
                />
              </TableCell>

              <TableCell>
                <TextField
                  value={
                    quickFilters.barcode
                  }
                  onChange={(e) =>
                    setQuickFilters(
                      (f) => ({
                        ...f,
                        barcode:
                          e.target.value,
                      })
                    )
                  }
                  size="small"
                  placeholder="Código"
                />
              </TableCell>

              <TableCell>
                <TextField
                  value={
                    quickFilters.createdBy
                  }
                  onChange={(e) =>
                    setQuickFilters(
                      (f) => ({
                        ...f,
                        createdBy:
                          e.target.value,
                      })
                    )
                  }
                  size="small"
                  placeholder="Usuario"
                />
              </TableCell>

              <TableCell>
                <TextField
                  value={
                    quickFilters.branch
                  }
                  onChange={(e) =>
                    setQuickFilters(
                      (f) => ({
                        ...f,
                        branch:
                          e.target.value,
                      })
                    )
                  }
                  size="small"
                  placeholder="Sucursal"
                />
              </TableCell>

              <TableCell>
                <FormControl
                  size="small"
                  fullWidth
                >
                  <InputLabel>
                    Lista
                  </InputLabel>

                  <Select
                    value={
                      quickFilters.expirationList
                    }
                    label="Lista"
                    onChange={(e) =>
                      setQuickFilters(
                        (f) => ({
                          ...f,
                          expirationList:
                            e.target.value,
                        })
                      )
                    }
                  >
                    <MenuItem value="">
                      Todas
                    </MenuItem>

                    {expirationListOptions.map(
                      (listName) => (
                        <MenuItem
                          key={listName}
                          value={listName}
                        >
                          {listName}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </TableCell>

              <TableCell colSpan={4} />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={`${row.productId}-${row.lotId}`}
              >
                <TableCell>
                  {row.productName}
                </TableCell>

                <TableCell>
                  {row.barcode}
                </TableCell>

                <TableCell>
                  {row.createdBy}
                </TableCell>

                <TableCell>
                  {row.branch}
                </TableCell>

                <TableCell>
                  {row.expirationLists.join(
                    ", "
                  )}
                </TableCell>

                <TableCell>
                  {row.quantity}
                </TableCell>

                <TableCell>
                  {formatDate(
                    row.expirationDate.toISOString()
                  )}
                </TableCell>

                <TableCell>
                  {formatDateWhitDay(
                    row.createdAt.toISOString()
                  )}
                </TableCell>

                <TableCell>
                  {row.overstock
                    ? "Sí"
                    : "No"}
                </TableCell>

                <TableCell>
                  <Tooltip title="Eliminar lote">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        deleteLot(
                          row.productId,
                          row.lotId
                        )
                      }
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

      <AppSnackbar
        snackbar={snackbar}
        onClose={closeSnackbar}
      />
    </Box>
  );
}