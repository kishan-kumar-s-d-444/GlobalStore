import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000000, // 10MB limit
  },
  type: {
    type: String,
    enum: ["text", "image", "video"],
    default: "text",
  },
  time: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
