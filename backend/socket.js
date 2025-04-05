const Message = require("./models/message.model");

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

      // Emit to everyone in the room
      io.to(roomId).emit("message", data);

      // Save to DB
      try {
        const message = new Message({ roomId, content, type, sender, time });
        await message.save();
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;
