import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; // 👈 Importar morgan
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import lotRoutes from './routes/lotRoutes.js';
import userRoutes from './routes/usersRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import productListRoutes from './routes/productListRoutes.js';

const allowedOrigins = [
  'http://localhost:5173',
  'https://gestion-vencimientos.vercel.app'
];

dotenv.config();
const app = express();


app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(express.json());
app.use(morgan('dev')); // 👈 Middleware para mostrar logs en consola

connectDB();

app.use('/products', productRoutes);
app.use('/lots', lotRoutes);
app.use('/users', userRoutes);
app.use('/branches', branchRoutes);
app.use('/product-lists', productListRoutes);
// app.use('/productImport', importRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
