import { create } from "zustand";
import axios from "axios";

const useProductListStore = create((set, get) => ({
  productLists: [],
  selectedListIds: [],
  productsFromSelectedLists: [],
  setSelectedListIds: (ids) => set({ selectedListIds: ids }),

  fetchProductLists: async (branchId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/product-lists?branch=${branchId}`
      );
      set({ productLists: res.data });
    } catch (err) {
      console.error("Error cargando listas:", err);
    }
  },
  fetchProductListsByBranch: async (branchId) => {
    if (!branchId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/product-lists/branch/${branchId}`
      );
      set({ productLists: res.data });
    } catch (err) {
      console.error("Error cargando listas:", err);
    }
  },
  fetchProductsFromSelectedLists: async () => {
    const { selectedListIds } = get();
    if (!selectedListIds.length) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/product-lists/products`,
        {
          listIds: selectedListIds,
        }
      );
      set({ productsFromSelectedLists: res.data });
    } catch (err) {
      console.error("Error obteniendo productos:", err);
    }
  },
  usarTodosLosProductos: false,
setUsarTodosLosProductos: (flag) => set({ usarTodosLosProductos: flag }),

}));

export default useProductListStore;
