// import { create } from "zustand";
// import axios from "axios";

// const useBranchStore = create((set) => ({
//   branches: [],
//   selectedBranchId: "",

//   setSelectedBranchId: (id) => set({ selectedBranchId: id }),
  
//   fetchBranches: async () => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
//       set({ branches: res.data });
//     } catch (err) {
//       console.error("Error cargando sucursales:", err);
//     }
//   },
  
// }));

// export default useBranchStore;


import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useBranchStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: "branch-storage", // nombre de la clave en localStorage
      partialize: (state) => ({ selectedBranchId: state.selectedBranchId }), 
      // guardamos solo selectedBranchId en localStorage para no almacenar todo el estado
    }
  )
);

export default useBranchStore;
