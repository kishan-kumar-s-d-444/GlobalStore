import Message from "./models/message.model.js";

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // Join room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      const { roomId, content, type, sender, time } = data;

      // Check content size
      if (content && content.length > 10000000) { // 10MB limit
        socket.emit("messageError", { error: "Message content too large. Maximum size is 10MB." });
        return;
      }

      // Save to DB first
      try {
        const message = new Message({ roomId, content, type, sender, time });
        await message.save();
        console.log("Message saved successfully:", message._id);
        
        // Add the database ID to the message data
        const messageWithId = {
          ...data,
          _id: message._id
        };
        
        // Emit to everyone in the room with the database ID
        io.to(roomId).emit("message", messageWithId);
      } catch (err) {
        console.error("Error saving message:", err);
        // Notify the sender that the message couldn't be saved
        socket.emit("messageError", { error: "Failed to save message to database" });
      }
    });

    // Handle deleting messages
    socket.on("deleteMessage", async (data) => {
      const { messageId } = data;
      
      console.log("Delete message request received:", data);
      
      if (!messageId) {
        socket.emit("messageError", { error: "Message ID is required" });
        return;
      }
      
      try {
        // Find the message first to get the roomId
        const message = await Message.findById(messageId);
        
        if (!message) {
          console.log("Message not found with ID:", messageId);
          socket.emit("messageError", { error: "Message not found" });
          return;
        }
        
        // Store the roomId before deleting
        const roomId = message.roomId;
        
        // Delete the message from the database
        await Message.findByIdAndDelete(messageId);
        
        // Emit the deleted message ID to all users in the room
        io.to(roomId.toString()).emit("messageDeleted", { _id: messageId });
        
        console.log("Message deleted successfully:", messageId, "from room:", roomId);
      } catch (err) {
        console.error("Error deleting message:", err);
        socket.emit("messageError", { error: "Failed to delete message" });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}

export default setupSocket;
