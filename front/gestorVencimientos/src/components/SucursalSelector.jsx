// src/components/SucursalSelector.jsx
import React, { useEffect } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
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

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Sucursal</InputLabel>
      
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
