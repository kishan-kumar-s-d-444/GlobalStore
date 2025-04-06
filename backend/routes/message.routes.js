import express from 'express';
const router = express.Router();
import { createMessage, getMessagesByRoom,deleteMessage } from '../controllers/message.controller.js';

router.post("/", createMessage);
router.get("/:roomId", getMessagesByRoom);
router.put("/delete/:messageId", deleteMessage);
export default router; 
