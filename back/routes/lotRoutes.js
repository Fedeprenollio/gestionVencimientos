// routes/lotRoutes.js
import express from 'express';
import {
  addLot,
  deleteLot,
  getExpiringLots,
  getLotsByProductId,
} from '../controllers/lotController.js';

const lotRoutes = express.Router();

lotRoutes.get('/product/:productId', getLotsByProductId);
lotRoutes.post('/', addLot);
lotRoutes.delete('/:lotId', deleteLot);
lotRoutes.get('/expiring', getExpiringLots);

export default lotRoutes;
