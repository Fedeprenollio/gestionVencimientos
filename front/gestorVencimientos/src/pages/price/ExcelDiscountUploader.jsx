// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Box,
//   List,
//   ListItem,
// } from "@mui/material";
// import * as XLSX from "xlsx";
// import { AddCircleOutline } from "@mui/icons-material";

// const ExcelDiscountUploader = ({
//   open,
//   onClose,
//   productos,
//   setProductos,
//   tipoEtiqueta,
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [agregados, setAgregados] = useState([]);
//   const [actualizados, setActualizados] = useState([]);
//   const [errores, setErrores] = useState([]);
//   const [temporalesPendientes, setTemporalesPendientes] = useState([]);

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setLoading(true);
//     setAgregados([]);
//     setActualizados([]);
//     setErrores([]);
//     setTemporalesPendientes([]);

//     try {
//       const reader = new FileReader();
//       reader.onload = async (evt) => {
//         const bstr = evt.target.result;
//         const workbook = XLSX.read(bstr, { type: "binary" });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const data = XLSX.utils.sheet_to_json(sheet);

//         let nuevos = [];
//         let actualizadosTmp = [];
//         let erroresTmp = [];
//         let temporales = [];

//         for (const row of data) {
//           const codebar = row.Codebar?.toString().trim();
//           const unitario = Number(row.Unitario);
//           const descuento = Number(row.Descuento) || 0;

//           if (!codebar) {
//             erroresTmp.push({ row, error: "No tiene código de barra" });
//             continue;
//           }

//           const indexExistente = productos.findIndex(
//             (p) => String(p.barcode) === codebar
//           );

//           if (indexExistente !== -1) {
//             const prod = productos[indexExistente];
//             const nuevoPrecio =
//               unitario > 0
//                 ? unitario
//                 : prod.currentPrice || prod.manualPrice || 0;

//             const nuevoDescuento =
//               descuento > 0 && descuento < 100 ? descuento : 0;

//             const nuevoDescuentoPrecio =
//               nuevoDescuento > 0
//                 ? Number((nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2))
//                 : nuevoPrecio;

//             const actualizado = {
//               ...prod,
//               currentPrice: nuevoPrecio,
//               manualPrice: unitario > 0 ? unitario : prod.manualPrice,
//               discount: nuevoDescuento,
//               discountedPrice: nuevoDescuentoPrecio,
//             };

//             productos[indexExistente] = actualizado;

//             actualizadosTmp.push({
//               name: prod.name,
//               old: prod.currentPrice,
//               new: nuevoPrecio,
//               discount: nuevoDescuento,
//             });
//           } else {
//             // Intentar buscar en la API
//             try {
//               const res = await fetch(
//                 `${import.meta.env.VITE_API_URL}/products/${codebar}`
//               );
//               if (!res.ok) throw new Error("Producto no encontrado en API");

//               const dataAPI = await res.json();

//               const nuevoPrecio =
//                 unitario > 0 ? unitario : dataAPI.currentPrice || 0;

//               const nuevoDescuento =
//                 descuento > 0 && descuento < 100 ? descuento : 0;

//               const nuevoDescuentoPrecio =
//                 nuevoDescuento > 0
//                   ? Number(
//                       (nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2)
//                     )
//                   : nuevoPrecio;

//               const nuevoProducto = {
//                 ...dataAPI,
//                 tipoEtiqueta: tipoEtiqueta || "clasica",
//                 manualPrice: unitario > 0 ? unitario : null,
//                 currentPrice: nuevoPrecio,
//                 discount: nuevoDescuento,
//                 discountedPrice: nuevoDescuentoPrecio,
//               };

//               nuevos.push(nuevoProducto);
//             } catch (error) {
//               const nombre = row.Producto || row.Nombre || null;

//               if (nombre) {
//                 const nuevoPrecio = unitario > 0 ? unitario : 0;

//                 const nuevoDescuento =
//                   descuento > 0 && descuento < 100 ? descuento : 0;

//                 const nuevoDescuentoPrecio =
//                   nuevoDescuento > 0
//                     ? Number(
//                         (nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2)
//                       )
//                     : nuevoPrecio;

//                 const productoTemporal = {
//                   name: nombre,
//                   barcode: codebar,
//                   tipoEtiqueta: tipoEtiqueta || "clasica",
//                   manualPrice: unitario > 0 ? unitario : null,
//                   currentPrice: nuevoPrecio,
//                   discount: nuevoDescuento,
//                   discountedPrice: nuevoDescuentoPrecio,
//                   temporal: true,
//                 };

//                 temporales.push(productoTemporal);
//               } else {
//                 erroresTmp.push({
//                   codebar,
//                   error:
//                     "Producto no encontrado en API y sin nombre para crear temporal",
//                 });
//               }
//             }
//           }
//         }

//         if (nuevos.length > 0) {
//           setProductos((prev) => [...prev, ...nuevos]);
//         }

//         setAgregados(nuevos);
//         setActualizados(actualizadosTmp);
//         setErrores(erroresTmp);
//         setTemporalesPendientes(temporales);
//         setLoading(false);
//       };

//       reader.readAsBinaryString(file);
//     } catch (error) {
//       setErrores([{ error: error.message }]);
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Actualizar precios desde Excel</DialogTitle>
//       <DialogContent>
//         <Typography variant="body2" gutterBottom>
//           Subí un archivo Excel con columnas <strong>Codebar</strong>,{" "}
//           <strong>Unitario</strong> y <strong>Descuento</strong> (Nombre es opcional)
//         </Typography>
//         <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
//         {loading && <Typography>Cargando...</Typography>}

//         {(agregados.length > 0 || actualizados.length > 0) && (
//           <Box mt={2}>
//             {agregados.length > 0 && (
//               <>
//                 <Typography variant="subtitle1">
//                   Productos agregados ({agregados.length}):
//                 </Typography>
//                 <List dense>
//                   {agregados.map((p, i) => (
//                     <ListItem key={i}>
//                       {p.name} - ${p.currentPrice.toFixed(2)}
//                     </ListItem>
//                   ))}
//                 </List>
//               </>
//             )}

//             {actualizados.length > 0 && (
//               <>
//                 <Typography variant="subtitle1" mt={2}>
//                   Productos actualizados ({actualizados.length}):
//                 </Typography>
//                 <List dense>
//                   {actualizados.map((p, i) => (
//                     <ListItem key={i}>
//                       {p.name} - ${p.old.toFixed(2)} → ${p.new.toFixed(2)}{" "}
//                       {p.discount ? `(${p.discount}% OFF)` : ""}
//                     </ListItem>
//                   ))}
//                 </List>
//               </>
//             )}
//           </Box>
//         )}

//         {temporalesPendientes.length > 0 && (
//           <Box mt={3} borderTop="1px solid #ccc" pt={2}>
//             <Typography variant="subtitle1" color="warning.main">
//               Productos no encontrados en la base de datos
//             </Typography>
//             <Typography variant="body2" mb={1}>
//               Se pueden agregar de forma temporal para generar etiquetas.
//             </Typography>
//             <List dense>
//               {temporalesPendientes.map((p, i) => (
//                 <ListItem key={i}>
//                   {p.name} - {p.barcode} - ${p.currentPrice.toFixed(2)}{" "}
//                   {p.discount ? `(${p.discount}% OFF)` : ""}
//                 </ListItem>
//               ))}
//             </List>
//             <Button
//               variant="outlined"
//               startIcon={<AddCircleOutline />}
//               color="warning"
//               sx={{ mt: 1 }}
//               onClick={() => {
//                 setProductos((prev) => [...prev, ...temporalesPendientes]);
//                 setAgregados((prev) => [...prev, ...temporalesPendientes]);
//                 setTemporalesPendientes([]);
//               }}
//             >
//               Agregar productos temporales ({temporalesPendientes.length})
//             </Button>
//           </Box>
//         )}

//         {errores.length > 0 && (
//           <Box mt={3}>
//             <Typography variant="subtitle1" color="error">
//               Errores:
//             </Typography>
//             <List dense>
//               {errores.map((err, i) => (
//                 <ListItem key={i}>
//                   {err.codebar ? `Código: ${err.codebar} - ` : ""}
//                   {err.error}
//                 </ListItem>
//               ))}
//             </List>
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cerrar</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ExcelDiscountUploader;
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
} from "@mui/material";
import * as XLSX from "xlsx";
import { AddCircleOutline } from "@mui/icons-material";
import axios from "axios";

const ExcelDiscountUploader = ({
  open,
  onClose,
  productos,
  setProductos,
  tipoEtiqueta,
}) => {
  const [loading, setLoading] = useState(false);
  const [agregados, setAgregados] = useState([]);
  const [actualizados, setActualizados] = useState([]);
  const [errores, setErrores] = useState([]);
  const [temporalesPendientes, setTemporalesPendientes] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setAgregados([]);
    setActualizados([]);
    setErrores([]);
    setTemporalesPendientes([]);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        let nuevos = [];
        let actualizadosTmp = [];
        let erroresTmp = [];
        let temporales = [];

        const codebarsExcel = data
          .map((row) => row.Codebar?.toString().trim())
          .filter(Boolean);
        const codebarsExistentes = productos.map((p) => String(p.barcode));
        const codebarsDesconocidos = codebarsExcel.filter(
          (cb) => !codebarsExistentes.includes(cb)
        );

        let productosDesdeAPI = [];
        try {
          if (codebarsDesconocidos.length > 0) {
            const res = await axios.post(
              `${import.meta.env.VITE_API_URL}/products/by-codebars`,
              { codebars: codebarsDesconocidos }
            );
            productosDesdeAPI = res.data;
          }
        } catch (err) {
          console.error("Error al buscar productos por codebars:", err);
        }

        for (const row of data) {
          const codebar = row.Codebar?.toString().trim();
          const unitario = Number(row.Unitario);
          let descuento = Number(row.Descuento) || 0;
          if (descuento > 0 && descuento <= 1) {
            descuento = descuento * 100;
          }

          if (!codebar) {
            erroresTmp.push({ row, error: "No tiene código de barra" });
            continue;
          }

          const indexExistente = productos.findIndex(
            (p) => String(p.barcode) === codebar
          );

          if (indexExistente !== -1) {
            const prod = productos[indexExistente];
            const nuevoPrecio =
              unitario > 0
                ? unitario
                : prod.currentPrice || prod.manualPrice || 0;
            const nuevoDescuento =
              descuento > 0 && descuento < 100 ? descuento : 0;
            const nuevoDescuentoPrecio =
              nuevoDescuento > 0
                ? Number((nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2))
                : nuevoPrecio;

            const actualizado = {
              ...prod,
              currentPrice: nuevoPrecio,
              manualPrice: unitario > 0 ? unitario : prod.manualPrice,
              discount: nuevoDescuento,
              discountedPrice: nuevoDescuentoPrecio,
            };

            productos[indexExistente] = actualizado;

            actualizadosTmp.push({
              name: prod.name,
              old: prod.currentPrice,
              new: nuevoPrecio,
              discount: nuevoDescuento,
            });
          } else {
            const productoAPI = productosDesdeAPI.find(
              (p) => String(p.barcode) === codebar
            );

            if (productoAPI) {
              const nuevoPrecio =
                unitario > 0 ? unitario : productoAPI.currentPrice || 0;
              const nuevoDescuento =
                descuento > 0 && descuento < 100 ? descuento : 0;
              const nuevoDescuentoPrecio =
                nuevoDescuento > 0
                  ? Number(
                      (nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2)
                    )
                  : nuevoPrecio;

              const nuevoProducto = {
                ...productoAPI,
                tipoEtiqueta: tipoEtiqueta || "clasica",
                manualPrice: unitario > 0 ? unitario : null,
                currentPrice: nuevoPrecio,
                discount: nuevoDescuento,
                discountedPrice: nuevoDescuentoPrecio,
              };

              nuevos.push(nuevoProducto);
            } else {
              const nombre = row.Producto || row.Nombre || null;
              if (nombre) {
                const nuevoPrecio = unitario > 0 ? unitario : 0;
                const nuevoDescuento =
                  descuento > 0 && descuento < 100 ? descuento : 0;
                const nuevoDescuentoPrecio =
                  nuevoDescuento > 0
                    ? Number(
                        (nuevoPrecio * (1 - nuevoDescuento / 100)).toFixed(2)
                      )
                    : nuevoPrecio;

                const productoTemporal = {
                  name: nombre,
                  barcode: codebar,
                  tipoEtiqueta: tipoEtiqueta || "clasica",
                  manualPrice: unitario > 0 ? unitario : null,
                  currentPrice: nuevoPrecio,
                  discount: nuevoDescuento,
                  discountedPrice: nuevoDescuentoPrecio,
                  temporal: true,
                };

                temporales.push(productoTemporal);
              } else {
                erroresTmp.push({
                  codebar,
                  error:
                    "Producto no encontrado en API y sin nombre para crear temporal",
                });
              }
            }
          }
        }

        if (nuevos.length > 0) {
          setProductos((prev) => [...prev, ...nuevos]);
        }

        setAgregados(nuevos);
        setActualizados(actualizadosTmp);
        setErrores(erroresTmp);
        setTemporalesPendientes(temporales);
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      setErrores([{ error: error.message }]);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Actualizar precios desde Excel</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Subí un archivo Excel con columnas <strong>Codebar</strong>,{" "}
          <strong>Unitario</strong> y <strong>Descuento</strong> (Nombre es
          opcional)
        </Typography>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        {loading && <Typography>Cargando...</Typography>}

        {(agregados.length > 0 || actualizados.length > 0) && (
          <Box mt={2}>
            {agregados.length > 0 && (
              <>
                <Typography variant="subtitle1">
                  Productos agregados ({agregados.length}):
                </Typography>
                <List dense>
                  {agregados.map((p, i) => (
                    <ListItem key={i}>
                      <Typography component="span">
                        {p.name} – <strong>${p.currentPrice.toFixed(2)}</strong>{" "}
                        {p.discount ? (
                          <Typography
                            component="span"
                            sx={{ color: "success.main", fontWeight: "bold" }}
                          >
                            ({p.discount}% OFF)
                          </Typography>
                        ) : null}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {actualizados.length > 0 && (
              <>
                <Typography variant="subtitle1" mt={2}>
                  Productos actualizados ({actualizados.length}):
                </Typography>
                <List dense>
                  {actualizados.map((p, i) => (
                    <ListItem key={i}>
                      {p.name} - ${p.old.toFixed(2)} → ${p.new.toFixed(2)}{" "}
                      {p.discount ? `(${p.discount}% OFF)` : ""}
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        )}

        {temporalesPendientes.length > 0 && (
          <Box mt={3} borderTop="1px solid #ccc" pt={2}>
            <Typography variant="subtitle1" color="warning.main">
              Productos no encontrados en la base de datos
            </Typography>
            <Typography variant="body2" gutterBottom>
              Se pueden agregar de forma temporal para generar etiquetas.
            </Typography>
            <List dense>
                  {temporalesPendientes.map((p, i) => (
                    <ListItem key={i}>
                      <Typography component="span">
                        {p.name} – <strong>${p.currentPrice.toFixed(2)}</strong>{" "}
                        {p.discount ? (
                          <Typography
                            component="span"
                            sx={{ color: "success.main", fontWeight: "bold" }}
                          >
                            ({p.discount}% OFF)
                          </Typography>
                        ) : null}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutline />}
              color="warning"
              sx={{ mt: 1 }}
              onClick={() => {
                setProductos((prev) => [...prev, ...temporalesPendientes]);
                setAgregados((prev) => [...prev, ...temporalesPendientes]);
                setTemporalesPendientes([]);
              }}
            >
              Agregar productos temporales ({temporalesPendientes.length})
            </Button>
          </Box>
        )}

        {errores.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" color="error">
              Errores:
            </Typography>
            <List dense>
              {errores.map((err, i) => (
                <ListItem key={i}>
                  {err.codebar ? `Código: ${err.codebar} - ` : ""}
                  {err.error}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelDiscountUploader;
