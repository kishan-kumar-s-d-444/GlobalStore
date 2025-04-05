const Message = require("../models/message.model");

exports.createMessage = async (req, res) => {
  try {
    const { roomId, content, type, sender } = req.body;

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
exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to get messages" });
  }
};
