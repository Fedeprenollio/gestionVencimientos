// src/store/usePromoStore.js
import { create } from "zustand";

const usePromoStore = create((set) => ({
  promotions: [],
  setPromotions: (promos) => set({ promotions: promos }),
}));

export default usePromoStore;
