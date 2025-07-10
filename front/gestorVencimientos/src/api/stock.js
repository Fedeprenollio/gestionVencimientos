
import api from "./axiosInstance";



export const getProductsWhithStock = async ({branchId}) =>{
  const res = await api.get(`/stock/con-stock/${branchId}`);
return res

}




