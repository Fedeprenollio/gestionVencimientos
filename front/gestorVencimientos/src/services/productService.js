import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const searchProductsByName = async (name) => {
  const res = await axios.get(`${API}/products/search?name=${name}`);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await axios.put(`${API}/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API}/products/${id}`);
  return res.data;
};
