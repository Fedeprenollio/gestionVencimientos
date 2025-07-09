import api from "./axiosInstance";

const BASE = "/product-lists";

export const fetchLists = () => api.get(BASE);
export const fetchListById = (id) => api.get(`${BASE}/${id}`);
export const createList = (data) => api.post(BASE, data);
export const updateList = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteList = (id) => api.delete(`${BASE}/${id}`);
export const getProductListsByBranch = (branchId) =>
  api.get(`${BASE}/branch/${branchId}`);

// Agregar un producto a una lista
export const addProductToList = (listId, productId) =>
  api.put(`${BASE}/${listId}/add/${productId}`); // en listApi.js

//AGREGO MULTIPLE A LISTA:
export const addMultipleProductsToList = (listId, barcodes) =>
  api.post(
    `${BASE}/${listId}/add-multiple`,
    { barcodes }
  );
  //ELIMINAR MULTIPLE
export const removeMultipleProductsFromList = (listId, productIds) =>
  api.put(`${BASE}/${listId}/remove-many`, { productIds });

export const removeProductFromList = (listId, productId) =>
  api.put(`${BASE}/${listId}/remove/${productId}`);
// src/api/listApi.js

export const addQuickProductsToList = (listId, quickProducts) =>
  api.put(`/product-lists/${listId}/quick-products`, { items: quickProducts });

export const getQuickProductsFromList = (listId) =>
  api.get(`/product-lists/${listId}/quick-products`);
export const clearQuickProductsFromList = (listId) =>
  api.delete(`${BASE}/${listId}/quick-products`);
