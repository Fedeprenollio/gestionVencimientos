import api from "./axiosInstance";

const BASE = "/product-lists";

export const fetchLists = () => api.get(BASE);
export const fetchListById = (id) => api.get(`${BASE}/${id}`);
export const createList = (data) => api.post(BASE, data);
export const updateList = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteList = (id) => api.delete(`${BASE}/${id}`);
export const getProductListsByBranch = (branchId) => api.get(`${BASE}/branch/${branchId}`);
