import express from "express";
import { addToGallery, getGalleryByUserId } from "../controllers/gallery.controller.js";

const router = express.Router();

// POST: Add a purchased product to the gallery
router.post('/add', addToGallery);

// GET: Get all purchased products for a user
router.get('/:userId', getGalleryByUserId);

export default router;
