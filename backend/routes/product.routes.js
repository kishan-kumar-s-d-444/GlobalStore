import express from 'express';
import {
    addProduct,
    getProductsByRoom,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller.js';
import upload from '../middlewares/upload.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Add a new product
router.post('/', verifyToken, upload.single('file'), addProduct);

// Get all products for a room
router.get('/room/:roomId', verifyToken, getProductsByRoom);

// Get a single product
router.get('/:id', verifyToken, getProductById);

// Update a product
router.put('/:id', verifyToken, updateProduct);

// Delete a product
router.delete('/:id', verifyToken, deleteProduct);

export default router;