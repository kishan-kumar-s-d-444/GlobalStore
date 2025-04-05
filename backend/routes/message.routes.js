import express from 'express';
const router = express.Router();
import {createMessage,getMessagesByRoom,} from '../controllers/message.controller.js'

// Create message
router.post("/", createMessage);

// Get messages by room ID
router.get("/:roomId", getMessagesByRoom);

export default router; 
