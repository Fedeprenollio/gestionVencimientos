// routes/lotRoutes.js
import express from 'express';
import {
  addLot,
  deleteLot,
  getExpiringLots,
  getExpiringLotsFlat,
  getLotsByProductId,
  updateLot,
} from '../controllers/lotController.js';
import { authenticate } from '../middlewares/auth.js';

const lotRoutes = express.Router();

lotRoutes.get('/product/:productId', getLotsByProductId);
lotRoutes.post('/',authenticate, addLot);
lotRoutes.delete('/:lotId', deleteLot);
// lotRoutes.get('/expiring', getExpiringLots);
lotRoutes.put('/:lotId', updateLot);
lotRoutes.get('/expiring', getExpiringLotsFlat);


export default lotRoutes;
