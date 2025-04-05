import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },
  roomImage: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

export const Room = mongoose.model("Room", roomSchema);
