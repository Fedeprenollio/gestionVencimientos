import express from "express";
import {
    checkExpiredPromos,
  createPromotion,
  deletePromotion,
  getActivePromotions,
  getAllPromotions,
  getExpiredOrSoonToExpirePromotions,
  getPromotionsByBranch,
  updatePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();

router.post("/", createPromotion);
// router.get("/by-branch", getPromotionsByBranch);
router.get("/active", getActivePromotions);
router.get("/expired", getExpiredOrSoonToExpirePromotions);

router.get("/", getPromotionsByBranch);
router.put("/:id", updatePromotion); // ✅ actualizar promoción
router.delete("/:id", deletePromotion); // ✅ eliminar promoción
router.get("/check-expired-promos", checkExpiredPromos);
export default router;
