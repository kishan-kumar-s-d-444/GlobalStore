import Message from "../models/message.model.js";
import mongoose from "mongoose";

export const createMessage = async (req, res) => {
  try {
    const { roomId, content, type, sender } = req.body;

    // Validate roomId
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid room ID" 
      });
    }

    const message = await Message.create({ roomId, content, type, sender });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// Get all messages for a room
export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid room ID" 
      });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to get messages" });
  }
};

// Delete a message completely from the database
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Validate messageId
    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid message ID" 
      });
    }

    // Find the message first to get the roomId
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }

    // Store the roomId before deleting
    const roomId = message.roomId;

    // Delete the message from the database
    await Message.findByIdAndDelete(messageId);

    // If this is a socket request, emit the event
    if (req.app.get && req.app.get("io")) {
      const io = req.app.get("io");
      io.to(roomId.toString()).emit("messageDeleted", { _id: messageId });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Message deleted successfully",
      data: { _id: messageId }
    });
  } catch (err) {
    console.error("Delete message error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to delete message" 
    });
  }
};