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

  devolucionesPorVencimiento: [],
  setDevolucionesPorVencimiento: (data) =>
    set({ devolucionesPorVencimiento: data }),

  movimientoLento: [],
  setMovimientoLento: (data) => set({ movimientoLento: data }),


  movimientoPerdido: [],
setMovimientoPerdido: (data) => set({ movimientoPerdido: data }),


mermaPorVencimiento: null,
setMermaPorVencimiento: (data) => set({ mermaPorVencimiento: data }),


}));

export default useInventoryStore;
