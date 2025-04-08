import express from "express";
import { createCheckoutSession } from "../controllers/purchase.controller.js";

const router = express.Router();

// POST /api/v1/purchase/checkout
router.post('/checkout', createCheckoutSession);

export default router;
