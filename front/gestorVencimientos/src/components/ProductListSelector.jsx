// src/components/ProductListSelector.jsx
import React, { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import useBranchStore from "../store/useBranchStore";
import useProductListStore from "../store/useProductListStore";

const ProductListSelector = () => {
  const { selectedBranchId } = useBranchStore();
  const {
    productLists,
    selectedListIds,
    fetchProductListsByBranch,
    setSelectedListIds,
    fetchProductsFromSelectedLists,
    usarTodosLosProductos,
    setUsarTodosLosProductos,
  } = useProductListStore();
  useEffect(() => {
    if (selectedBranchId) {
      fetchProductListsByBranch(selectedBranchId);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (selectedListIds.length) {
      fetchProductsFromSelectedLists();
    }
  }, [selectedListIds]);
  const allListIds = productLists.map((list) => list._id);

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Listas de Productos</InputLabel>
      <Select
        multiple
        value={usarTodosLosProductos ? ["ALL_PRODUCTS"] : selectedListIds}
        onChange={(e) => {
          const value = e.target.value;

          if (value.includes("ALL_PRODUCTS")) {
            setUsarTodosLosProductos(true);
            setSelectedListIds([]);
          } else if (value.includes("all")) {
            const allSelected = selectedListIds.length === allListIds.length;
            setSelectedListIds(allSelected ? [] : allListIds);
            setUsarTodosLosProductos(false);
          } else {
            // Si estaba seleccionado "Todos los productos", lo destildamos
            if (usarTodosLosProductos) {
              console.log("usarTodosLosProductos",usarTodosLosProductos)
              setUsarTodosLosProductos(false);
              setSelectedListIds([]);
            }

            setSelectedListIds(value);
          }
        }}
        input={<OutlinedInput label="Listas de Productos" />}
        renderValue={(selected) => {
          if (usarTodosLosProductos)
            return "Todos los productos del stock del local";
          return productLists
            .filter((list) => selected.includes(list._id))
            .map((list) => list.name)
            .join(", ");
        }}
      >
        <MenuItem value="ALL_PRODUCTS">
          <Checkbox checked={usarTodosLosProductos} />
          <ListItemText primary="Todos los productos del stock del local" />
        </MenuItem>

        <MenuItem value="all">
          <Checkbox
            checked={
              selectedListIds.length === productLists.length &&
              !usarTodosLosProductos
            }
          />
          <ListItemText primary="Todas las listas" />
        </MenuItem>

        {productLists.map((list) => (
          <MenuItem key={list._id} value={list._id}>
            <Checkbox checked={selectedListIds.includes(list._id)} />
            <ListItemText primary={list.name} />
          </MenuItem>
        ))}
      </Select>

      {/* Mostrar productos filtrados
      {productsFromSelectedLists?.length > 0 && (
        <ul>
          {productsFromSelectedLists.map((prod) => (
            <li key={prod._id}>{prod.name}</li>
          ))}
        </ul>
      )} */}
    </FormControl>
  );
};

export default ProductListSelector;
