import api from "./axiosInstance";

// Buscar productos por nombre (autocomplete)
export const fetchProducts = async (query) => {
  console.log("query", query);
  if (!query.trim()) return [];
  const res = await api.get(`/products/search?name=${query}`);
  console.log("APIIII RERS", res);
  return res;
};

// Buscar producto por código de barras
export const fetchProductByBarcode = async (barcode) => {
  const res = await api.get(`/products/barcode/${barcode}`);
  return res.data;
};

// Crear un producto si no existe
export const createProduct = async (productData) => {
  const res = await api.post("/products", productData);
  return res.data;
};

// Obtener un producto por ID
export const fetchProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// Listar todos los productos (paginado opcionalmente)
export const fetchAllProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

// Importar productos desde un archivo Excel
export const importProductsFromExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/productImport/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getProductsWithoutPrice = () => api.get("/products/without-price");

export const uploadPriceExcel = (data) =>
  api.post("/products/update-prices", { products: data });


export const getListById = async (id) => {
  const res = await api.get(`/product-lists/${id}`);
  console.log("res.dat",res)
  return res;
};
