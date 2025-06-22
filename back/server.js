import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; // 👈 Importar morgan
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import lotRoutes from './routes/lotRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // 👈 Middleware para mostrar logs en consola

connectDB();

app.use('/products', productRoutes);
app.use('/lots', lotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
