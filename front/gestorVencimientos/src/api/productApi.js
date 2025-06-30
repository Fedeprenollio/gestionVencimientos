import api from "./axiosInstance";

export const fetchProducts = async (query = "") => {
  if (!query.trim()) return [];
  const res = await api.get(`/products/search?name=${encodeURIComponent(query)}`);
  return res.data;
};
