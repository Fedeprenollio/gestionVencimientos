// src/api/branchApi.js

import api from "./axiosInstance";


const BASE = "/branches";

export const fetchBranches = () => api.get(BASE);
export const getBranchById = (id) => api.get(`${BASE}/${id}`);
export const createBranch = (data) => api.post(BASE, data);
export const updateBranch = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteBranch = (id) => api.delete(`${BASE}/${id}`);
