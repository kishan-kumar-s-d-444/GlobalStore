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

router.post('/', verifyToken, upload.productImage, addProduct);
router.get('/room/:roomId', verifyToken, getProductsByRoom);
router.get('/:id', verifyToken, getProductById);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;