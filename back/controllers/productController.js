import Product from '../models/Product.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);




// export const addOrUpdateProduct = async (req, res) => {
//   const { barcode, name, type, branch, expirationDate, quantity } = req.body;

//   if (!barcode || !name || !type || !branch || !expirationDate || !quantity) {
//     return res.status(400).json({ message: 'Faltan datos requeridos' });
//   }

//   try {
//     const product = await Product.findOne({ barcode });
//     console.log("expirationDate",expirationDate);

//     if (!product) {
//       // Producto nuevo
//       const newProduct = new Product({
//         barcode,
//         name,
//         type,
//         lots: [{ expirationDate, quantity, branch }],  // branch dentro de cada lote
//       });
//       await newProduct.save();
//       return res.status(201).json({ message: 'Producto creado' });
//     }

//     // Producto existente
//     const existingLot = product.lots.find(lot => lot.expirationDate === expirationDate && lot.branch === branch);

//     if (existingLot) {
//       // Ya hay un lote con esa fecha y sucursal: sumamos cantidad
//       existingLot.quantity += quantity;
//     } else {
//       // Nuevo lote
//       product.lots.push({ expirationDate, quantity, branch });
//     }

//     await product.save();
//     return res.status(200).json({ message: 'Producto actualizado' });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Error del servidor' });
//   }
// };

export const addOrUpdateProduct = async (req, res) => {
  const { barcode, name, type, branch, expirationDate, quantity } = req.body;

  if (!barcode || !name || !type || !branch || !expirationDate || !quantity) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    let product = await Product.findOne({ barcode });
    console.log("expirationDate", expirationDate);

    if (!product) {
      // Producto nuevo
      product = new Product({
        barcode,
        name,
        type,
        lots: [{ expirationDate, quantity, branch }],
      });
      await product.save();
      // Responder con el producto creado
      return res.status(201).json(product);
    }

    // Producto existente
    const existingLot = product.lots.find(
      (lot) =>
        lot.expirationDate.toISOString() === new Date(expirationDate).toISOString() &&
        lot.branch === branch
    );

    if (existingLot) {
      // Sumamos cantidad
      existingLot.quantity += quantity;
    } else {
      // Nuevo lote
      product.lots.push({ expirationDate, quantity, branch });
    }

    await product.save();

    // Volver a buscar el producto actualizado para enviar la versión actual
    const updatedProduct = await Product.findOne({ barcode });

    return res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};


export const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const addLotToProduct = async (req, res) => {
  const { barcode, expirationDate, quantity, branch } = req.body;

  if (!barcode || !expirationDate || !quantity || !branch) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Agregar el nuevo lote
    product.lots.push({ expirationDate, quantity, branch });

    await product.save();

    res.status(200).json({ message: 'Lote agregado', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar lote' });
  }
};

export const getExpiringProducts = async (req, res) => {
  const { from, months = 6, branch, type, createdFrom, createdTo } = req.query;

  // Convertir fechas a UTC partiendo de horario Argentina
  const fromDate = dayjs
    .tz(from || dayjs(), 'America/Argentina/Buenos_Aires')
    .startOf('month')
    .utc()
    .toDate();

  const untilDate = dayjs(fromDate).add(Number(months), 'month').toDate();

  // Rango de creación (createdAt)
  const createdCriteria = {};
  if (createdFrom) {
    createdCriteria.$gte = dayjs
      .tz(createdFrom, 'America/Argentina/Buenos_Aires')
      .startOf('day')
      .utc()
      .toDate();
  }
  if (createdTo) {
    createdCriteria.$lte = dayjs
      .tz(createdTo, 'America/Argentina/Buenos_Aires')
      .endOf('day')
      .utc()
      .toDate();
  }

  // Filtro general
  const match = { 'lots.expirationDate': { $gte: fromDate, $lt: untilDate } };
  if (branch) match['lots.branch'] = branch;
  if (type) match.type = type;

  try {
    const products = await Product.aggregate([
      { $match: match },
      {
        $project: {
          barcode: 1,
          name: 1,
          type: 1,
          lots: {
            $filter: {
              input: '$lots',
              as: 'lot',
              cond: {
                $and: [
                  { $gte: ['$$lot.expirationDate', fromDate] },
                  { $lt: ['$$lot.expirationDate', untilDate] },
                  ...(branch ? [{ $eq: ['$$lot.branch', branch] }] : []),
                  ...(createdFrom || createdTo
                    ? [
                        {
                          $and: [
                            ...(createdCriteria.$gte
                              ? [{ $gte: ['$$lot.createdAt', createdCriteria.$gte] }]
                              : []),
                            ...(createdCriteria.$lte
                              ? [{ $lte: ['$$lot.createdAt', createdCriteria.$lte] }]
                              : []),
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};


// export const getExpiringProducts = async (req, res) => {
//   const { from, months = 6, branch, type, createdFrom, createdTo } = req.query;

//   // Función para truncar a inicio de mes
//   const truncateToMonth = (date) => {
//     const d = new Date(date);
//     d.setDate(1);
//     d.setHours(0, 0, 0, 0);
//     return d;
//   };

//   // Rango de expiración
//   const fromDate = truncateToMonth(from ? new Date(from) : new Date());
//   const untilDate = new Date(fromDate);
//   untilDate.setMonth(untilDate.getMonth() + Number(months));

//   // Rango de creación
//   const createdCriteria = {};
//   if (createdFrom) {
//     const d = new Date(createdFrom);
//     d.setHours(0, 0, 0, 0);
//     createdCriteria.$gte = d;
//   }
//   if (createdTo) {
//     const d = new Date(createdTo);
//     d.setHours(23, 59, 59, 999);
//     createdCriteria.$lte = d;
//   }

//   // Construir match para productos
//   const match = { 'lots.expirationDate': { $gte: fromDate, $lt: untilDate } };
//   if (branch) match['lots.branch'] = branch;
//   if (type) match.type = type;

//   try {
//     const products = await Product.aggregate([
//       { $match: match },
//   {
//   $project: {
//     barcode: 1,
//     name: 1,
//     type: 1,
//     lots: {
//       $filter: {
//         input: '$lots',
//         as: 'lot',
//         cond: {
//           $and: [
//             { $gte: ['$$lot.expirationDate', fromDate] },
//             { $lt: ['$$lot.expirationDate', untilDate] },
//             ...(branch ? [{ $eq: ['$$lot.branch', branch] }] : []),
//             ...(createdFrom ? [{ $gte: ['$$lot.createdAt', new Date(createdFrom)] }] : []),
//             ...(createdTo ? [{ $lte: ['$$lot.createdAt', new Date(createdTo + 'T23:59:59.999Z')] }] : []),
//           ]
//         }
//       }
//     }
//   }
// }
//   ,
//       { $sort: { name: 1 } },
//     ]);
//     res.json(products);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error al obtener productos' });
//   }
// };

export const searchProductsByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Falta el nombre en la query" });
  }

  try {
    const regex = new RegExp(name, "i"); // búsqueda insensible a mayúsculas
    const products = await Product.find({ name: regex });

    res.json(products);
  } catch (err) {
    console.error("Error buscando por nombre:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


// controllers/productController.js
export const deleteLot = async (req, res) => {
  const { productId, lotId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const originalLength = product.lots.length;

    product.lots = product.lots.filter(lot => lot._id.toString() !== lotId);

    if (product.lots.length === originalLength) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    await product.save();
    res.json({ message: "Lote eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar el lote" });
  }
};
