import { create } from "zustand";
import axios from "axios";

const useStockStore = create((set, get) => ({
  selectedBranchId: null,
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),

  stockData: {}, // { [barcode]: quantity }
  loading: false,
  error: null,

  updateBulkStock: async (items) => {
    const branchId = get().selectedBranchId;
    if (!branchId) return;

    set({ loading: true, error: null });

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/stock/bulk-update`,
        { items, branchId }
      );
      console.log("✅ Stock actualizado");

      // Opcional: actualizar stock localmente
      const updatedStock = { ...get().stockData };
      items.forEach(({ codebar, quantity }) => {
        updatedStock[codebar] = quantity;
      });

      set({ stockData: updatedStock, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
      console.error("❌ Error al actualizar stock:", err);
    }
  },

  fetchStockByBranch: async () => {
    const branchId = get().selectedBranchId;
    if (!branchId) return;

    set({ loading: true });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/stock/by-branch/${branchId}`
      );

      // Suponiendo que devuelve { codebar: cantidad }
      const stockData = res.data;
      set({ stockData, loading: false });
    } catch (err) {
      console.error("Error al cargar stock:", err);
      set({ loading: false, error: err.message });
    }
  },

  getStock: (barcode) => {
    return get().stockData[barcode] ?? 0;
  },
}));

export default useStockStore;
