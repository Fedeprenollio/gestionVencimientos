// src/store/usePromoStore.js
import { create } from "zustand";
import axios from "axios";

const usePromoStore = create((set) => ({
  // promociones próximas a vencer
  promotions: [],
  setPromotions: (promos) => set({ promotions: promos }),

  // todas las promociones
  allPromotions: [],
  setAllPromotions: (promos) => set({ allPromotions: promos }),

  // acciones
  getExpiredPromotions: async (branchId) => {
    if (!branchId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/promotions/expired`,
        { params: { branchId } }
      );
      set({ promotions: res.data });
    } catch (error) {
      console.error("Error fetching expired promotions", error);
    }
  },

  getAllPromotions: async (branchId) => {
    if (!branchId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/promotions`,
        { params: { branchId } }
      );
      set({ allPromotions: res.data });
    } catch (error) {
      console.error("Error fetching all promotions", error);
    }
  },
}));

export default usePromoStore;
