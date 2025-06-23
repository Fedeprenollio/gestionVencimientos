// components/products/ProductListGrid.jsx
import { Box, Button, IconButton, Modal, TextField, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductFormSimple from "./formularios/ProductFormSimple";
import LotForm from "../lots/formularios/LotForm.jsx";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

export default function ProductListGrid() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingLotProduct, setAddingLotProduct] = useState(null);

  // Estados para LotForm
  const [productInfo, setProductInfo] = useState({ name: "", type: "medicamento" });
  const [productExists, setProductExists] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [branch, setBranch] = useState("sucursal1");
  const [overstock, setOverstock] = useState(false);

  // Al abrir modal de “Agregar lote” reseteamos estados
  useEffect(() => {
    if (addingLotProduct) {
      setProductInfo({
        name: addingLotProduct.name,
        type: addingLotProduct.type,
      });
      setProductExists(true);
      setQuantity(1);
      setExpMonth("");
      setExpYear("");
      setBranch("sucursal1");
      setOverstock(false);
    }
  }, [addingLotProduct]);

  const fetchProducts = async () => {
    try {
      const url = query.trim()
        ? `${import.meta.env.VITE_API_URL}/products/search?name=${query}`
        : `${import.meta.env.VITE_API_URL}/products`;
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error("Error buscando productos", err);
      alert("Error buscando productos");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
    fetchProducts();
  };

  const handleProductUpdate = async (updatedData) => {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/products/${editingProduct._id}`,
      updatedData
    );
    setEditingProduct(null);
    fetchProducts();
  };

  const handleAddLot = async (lotData) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/lots`, lotData);
    setAddingLotProduct(null);
    // opcional: refrescar lista o estados relacionados
  };

  const columns = [
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "barcode", headerName: "Código", width: 150 },
    { field: "type", headerName: "Tipo", width: 130 },
    {
      field: "actions",
      headerName: "Acciones",
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => setEditingProduct(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => setAddingLotProduct(params.row)}>
            <AddIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: 500, width: "100%", pt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lista de Todos los Productos
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="Buscar por nombre o código"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={fetchProducts}>
          Buscar
        </Button>
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row._id}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableRowSelectionOnClick
      />

      {/* Modal de edición */}
      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Editar Producto
          </Typography>
          <ProductFormSimple
            initialData={editingProduct}
            onSubmit={handleProductUpdate}
            onCancel={() => setEditingProduct(null)}
          />
        </Box>
      </Modal>

      {/* Modal para agregar lote */}
      <Modal open={!!addingLotProduct} onClose={() => setAddingLotProduct(null)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Agregar Lote a {addingLotProduct?.name}
          </Typography>
          <LotForm
            productInfo={productInfo}
            setProductInfo={setProductInfo}
            productExists={productExists}
            quantity={quantity}
            setQuantity={setQuantity}
            expMonth={expMonth}
            setExpMonth={setExpMonth}
            expYear={expYear}
            setExpYear={setExpYear}
            branch={branch}
            setBranch={setBranch}
            overstock={overstock}
            setOverstock={setOverstock}
            onSubmit={() =>
              handleAddLot({
                productId: addingLotProduct._id,
                expirationDate: new Date(`${expYear}-${expMonth}-01`).toISOString(),
                quantity: Number(quantity),
                branch,
                overstock,
              })
            }
            onCancel={() => setAddingLotProduct(null)}
          />
        </Box>
      </Modal>
    </Box>
  );
}


// // components/products/ProductListGrid.jsx
// import { Box, Button, IconButton, Modal, TextField, Typography } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import ProductFormSimple from "./formularios/ProductFormSimple";
// import LotForm from "../lots/formularios/LotForm.jsx";
// import AddIcon from "@mui/icons-material/Add";

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 3,
//   borderRadius: 2,
// };


// export default function ProductListGrid() {
//   const [products, setProducts] = useState([]);
//   const [query, setQuery] = useState("");
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [addingLotProduct, setAddingLotProduct] = useState(null);

// const [productInfo, setProductInfo] = useState({ name: "", type: "medicamento" });
//   const [productExists, setProductExists] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [expMonth, setExpMonth] = useState("");
//   const [expYear, setExpYear] = useState("");
//   const [branch, setBranch] = useState("sucursal1");

//  useEffect(() => {
//     if (addingLotProduct) {
//       setProductInfo({
//         name: addingLotProduct.name,
//         type: addingLotProduct.type,
//       });
//       setProductExists(true);
//       setQuantity(1);
//       setExpMonth("");
//       setExpYear("");
//     }
//   }, [addingLotProduct])

//   const handleClose = () => {
//     setEditingProduct(null);
//     setAddingLotProduct(null);
//   };

//   const fetchProducts = async () => {
//     try {
//       const url = query.trim()
//         ? `${import.meta.env.VITE_API_URL}/products/search?name=${query}`
//         : `${import.meta.env.VITE_API_URL}/products`;

//       const res = await axios.get(url);
//       setProducts(res.data);
//     } catch (err) {
//       console.error("Error buscando productos", err);
//       alert("Error buscando productos");
//     }
//   };
//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!confirm("¿Eliminar este producto?")) return;
//     try {
//       await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
//       fetchProducts();
//     } catch (err) {
//       alert("Error al eliminar");
//     }
//   };

//   const columns = [
//     { field: "name", headerName: "Nombre", flex: 1 },
//     { field: "barcode", headerName: "Código", width: 150 },
//     { field: "type", headerName: "Tipo", width: 130 },
//     {
//       field: "actions",
//       headerName: "Acciones",
//       sortable: false,
//       width: 150,
//       renderCell: (params) => (
//         <>
//           <IconButton onClick={() => setEditingProduct(params.row)}>
//             <EditIcon />
//           </IconButton>
//           <IconButton onClick={() => setAddingLotProduct(params.row)}>
//             <AddIcon />
//           </IconButton>
//         </>
//       ),
//     },
//   ];
//   const handleProductUpdate = async (updatedData) => {
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/products/${editingProduct._id}`,
//         updatedData
//       );
//       setEditingProduct(null);
//       fetchProducts();
//     } catch (err) {
//       console.error("Error actualizando producto", err);
//       alert("Error actualizando producto");
//     }
//   };

//   const handleAddLot = async (lotData) => {
//     console.log("CREANDO LOTE")
//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/lots`, lotData);
//       setAddingLotProduct(null);
//     } catch (err) {
//       console.error("Error agregando lote", err);
//       alert("Error agregando lote");
//     }
//   };

//   return (
//     <Box sx={{ height: 500, width: "100%", pt: 2 }}>
//       <Typography variant="h6" gutterBottom>
//         Lista de Todos los Productos
//       </Typography>
//       <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//         <TextField
//           label="Buscar por nombre o código"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           fullWidth
//         />
//         <Button variant="contained" onClick={fetchProducts}>
//           Buscar
//         </Button>
//       </Box>

//       <DataGrid
//         rows={products}
//         columns={columns}
//         getRowId={(row) => row._id}
//         pageSize={10}
//         rowsPerPageOptions={[10, 20, 50]}
//         disableRowSelectionOnClick
//       />

//       {/* Modal de edición */}
//       <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)}>
//         <Box sx={modalStyle}>
//           <Typography variant="h6" mb={2}>
//             Editar Producto
//           </Typography>
//           <ProductFormSimple
//             initialData={editingProduct}
//             onSubmit={handleProductUpdate}
//             onCancel={() => setEditingProduct(null)}
//           />
//         </Box>
//       </Modal>

//       {/* Modal de agregar lote */}
//         {/* Modal para agregar lote */}
//       <Modal open={!!addingLotProduct} onClose={() => setAddingLotProduct(null)}>
//         <Box sx={modalStyle}>
//           <Typography variant="h6" mb={2}>
//             Agregar Lote a {addingLotProduct?.name}
//           </Typography>
//            <LotForm
//             productInfo={productInfo}
//             setProductInfo={setProductInfo}
//             productExists={productExists}
//             quantity={quantity}
//             setQuantity={setQuantity}
//             expMonth={expMonth}
//             setExpMonth={setExpMonth}
//             expYear={expYear}
//             setExpYear={setExpYear}
//             branch={branch}
//             setBranch={setBranch}
//              overstock={overstock}
//             setOverstock={setOverstock}
//             onSubmit={() => {
//               handleAddLot({
//                 productId: addingLotProduct._id,
//                 barcode: "",
//                 quantity: Number(quantity),
//                 expirationDate: new Date(`${expYear}-${expMonth}-01`).toISOString(),
//                 branch,
//               });
//             }}
//             onCancel={() => setAddingLotProduct(null)}
//           />
//         </Box>
//       </Modal>
//     </Box>
//   );
// }

