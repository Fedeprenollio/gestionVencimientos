import { create } from "zustand";

const useInventoryStore = create((set) => ({
  dsiData: [],
  stockNormalizado: [],
  unidadesPerdidas: [],
  setIndicatorsData: ({ dsiData, stockNormalizado, unidadesPerdidas }) =>
    set({ dsiData, stockNormalizado, unidadesPerdidas }),

  usarTodosLosProductos: false,
  setUsarTodosLosProductos: (flag) => set({ usarTodosLosProductos: flag }),

   productosRecibidos: [],
  setProductosRecibidos: (data) => set({ productosRecibidos: data }),
}));

export default useInventoryStore;
