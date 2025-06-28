import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function createLot(data) {
  const res = await axios.post(`${API_URL}/lots`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.lot;
}

export async function updateLot(id, data) {
  const res = await axios.put(`${API_URL}/lots/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data.lot;
}

export async function deleteLot(id) {
  const res = await axios.delete(`${API_URL}/lots/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

export async function getLotsByProduct(productId) {
  const res = await axios.get(`${API_URL}/lots/product/${productId}`);
  return res.data.lots;
}
