import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  const { barcode, name, type, expirationDate, branch } = req.body;
  try {
    const exists = await Product.findOne({ barcode });
    if (exists) return res.status(400).json({ message: 'El código ya existe' });

    const product = await Product.create({ barcode, name, type, expirationDate, branch });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpiringProducts = async (req, res) => {
  const { from, months = 6, branch, type } = req.query;

  // Fecha base (desde)
  const fromDate = from ? new Date(from) : new Date();

  // Fecha límite (desde + X meses)
  const until = new Date(fromDate);
  until.setMonth(until.getMonth() + Number(months));

  // Filtro base: vencen entre fromDate y until
  const query = {
    expirationDate: { $gte: fromDate, $lte: until }
  };

  // Si se pasa branch, lo agregamos al filtro
  if (branch) query.branch = branch;

  // Si se pasa type, también
  if (type) query.type = type;

  // Buscar productos filtrados
  const products = await Product.find(query).sort('expirationDate');
  res.json(products);
};

