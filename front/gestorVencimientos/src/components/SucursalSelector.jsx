// src/components/SucursalSelector.jsx
import React, { useEffect } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import axios from "axios";
import useBranchStore from "../store/useBranchStore";

const SucursalSelector = () => {
  const {
    selectedBranchId,
    setSelectedBranchId,
    branches,
    fetchBranches,
  } = useBranchStore();

  useEffect(() => {
    fetchBranches();
  }, []);

  // useEffect(() => {
  //   if (selectedBranchId) {
  //     fetchStockByBranch();
  //   }
  // }, [selectedBranchId]);

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Sucursal</InputLabel>
      {selectedBranchId}
      <Select
        value={selectedBranchId || ""}
        onChange={(e) => setSelectedBranchId(e.target.value)}
        label="Sucursal"
      >
        {branches.map((b) => (
          <MenuItem key={b._id} value={b._id}>
            {b.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SucursalSelector;
