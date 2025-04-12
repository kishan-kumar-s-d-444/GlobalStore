import express from "express";
import { addToGallery, getGalleryByUserId,removeFromGallery } from "../controllers/gallery.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

// POST: Add a purchased product to the gallery
router.post('/add', addToGallery);

// GET: Get all purchased products for a user
router.get('/:userId', getGalleryByUserId);
router.delete('/remove/:id',verifyToken, removeFromGallery);
export default router;
