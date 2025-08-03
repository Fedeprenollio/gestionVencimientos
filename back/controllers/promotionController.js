import Promotion from "../models/Promotion.js";
import dayjs from "dayjs"; // Usamos esto para manejar fechas
import { sendPromoEmail } from "../utils/emailService.js"; // lo creamos ahora

export const createPromotion = async (req, res) => {
  try {
    const { title, branchId, startDate, endDate } = req.body;
    console.log("title, branchId, startDate, endDate...",title, branchId, startDate, endDate)
    const newPromotion = new Promotion({ title, branchId, startDate, endDate });
    await newPromotion.save();

    res.status(201).json({ message: "Promoción creada", promotion: newPromotion });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la promoción" });
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const today = new Date();
    const promotions = await Promotion.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate("branchId");

    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener promociones activas" });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate("branchId");
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener promociones" });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "Promoción no encontrada" });
    }

    res.status(200).json({ status: "ok", promotion: updated });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Promoción no encontrada" });
    }

    res.status(200).json({ status: "ok", promotion: deleted });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

// controllers/promotionController.js

export const getPromotionsByBranch = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) {
      return res.status(400).json({ message: "Falta el parámetro branchId" });
    }

    const promotions = await Promotion.find({ branchId: branchId }).sort({ startDate: -1 });
    res.json(promotions);
  } catch (error) {
    console.error("Error al obtener promociones por sucursal:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};



export const checkExpiredPromos = async (req, res) => {
  try {
    const today = dayjs().startOf('day').toDate();

    const promos = await Promotion.find({
      dates: { $elemMatch: { $eq: today } }, // promociones con fecha exacta = hoy
    });

    for (const promo of promos) {
      // Lógica para enviar email - simulamos con console.log
      console.log(`📩 Enviar email para promoción "${promo.title}"`);

      await sendPromoEmail(promo); // opcional
    }

    res.status(200).json({
      status: "ok",
      message: `${promos.length} promociones procesadas.`,
    });
  } catch (error) {
    console.error("Error al verificar promociones vencidas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getExpiredOrSoonToExpirePromotions = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) return res.status(400).json({ message: "branchId es requerido" });

    // Considerar promociones que ya vencieron o que vencen en los próximos 3 días
    const now = dayjs();
    const soonLimit = now.add(3, "day").endOf("day").toDate();

    const promotions = await Promotion.find({
      branchId,
      endDate: { $lte: soonLimit }, // vencidas o por vencer en 3 días
    }).sort({ endDate: 1 });

    res.json(promotions);
  } catch (error) {
    console.error("Error fetching expired promotions:", error);
    res.status(500).json({ message: "Error interno" });
  }
};