import { create } from "zustand";
import axios from "axios";

const useBranchStore = create((set) => ({
  branches: [],
  selectedBranchId: "",

  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
  
  fetchBranches: async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
      set({ branches: res.data });
    } catch (err) {
      console.error("Error cargando sucursales:", err);
    }
  },
}));

export default useBranchStore;
