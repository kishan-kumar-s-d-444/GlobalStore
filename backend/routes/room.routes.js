import express from 'express';
import { createroom, getallrooms } from '../controllers/room.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/createroom', auth, createroom);
router.get('/getallrooms', auth, getallrooms);

export default router; 