import * as yup from "yup";

export const expirationScannerSchema = yup.object().shape({
  month: yup.number().min(1).max(12).required("Mes requerido"),
  year: yup.number().min(2023).max(2100).required("Año requerido"),
  branch: yup.string().required("Sucursal requerida"),
});
