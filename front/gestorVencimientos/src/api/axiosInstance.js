// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/", // Puedes setear VITE_API_URL en tu .env
  withCredentials: true, // Opcional, si usás cookies/token
});

// Interceptor para devolver siempre res.data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Podés centralizar errores también acá si querés
    return Promise.reject(error);
  }
);

export default api;
