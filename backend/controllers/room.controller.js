// controllers/room.controller.js
import { Room } from "../models/room.model.js";

export const createRoom = async (req, res) => {
  try {
    console.log('Creating room, request body:', req.body);
    console.log('File:', req.file);
    
    const { roomName, roomType } = req.body;
    const roomImage = req.file?.path;
    const createdBy = req.userId;

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'Room image is required' });
    }

    if (!roomName || !roomImage || !roomType) {
      return res.status(400).json({ message: "Room name, type, and image are required" });
    }

    const newRoom = new Room({
      roomName,
      roomImage,
      roomType,
      createdBy,
      members: [createdBy], // Initialize members with creator
    });

    await newRoom.save();
    console.log('Room saved successfully:', newRoom);

    res.status(201).json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all rooms created by the logged-in user
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.userId });
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
};

export const getSingleRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ success: false, message: "Failed to fetch room" });
  }
};

export const getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ roomType: "public" }).populate("createdBy", "username");
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("Error fetching public rooms:", error);
    res.status(500).json({ success: false, message: "Failed to fetch public rooms" });
  }
};

// controllers/room.controller.js
export const joinRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.userId;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.members.includes(userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    room.members.push(userId);
    await room.save();

    res.status(200).json({ message: "Joined the room successfully", room });
  } catch (err) {
    console.error("Error joining room:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Make room public
export const makeRoomPublic = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    room.roomType = "public";
    await room.save();

    res.status(200).json({ message: "Room is now public", room });
  } catch (error) {
    console.error("Error making room public:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    await Room.findByIdAndDelete(req.params.roomId);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Leave a room
// Leave Room Controller
export const leaveRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.userId; // Comes from verifyToken middleware

  console.log('Attempting to leave room:', { roomId, userId });

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (room.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Creator cannot leave the room. Please delete or transfer ownership.",
      });
    }

    if (!room.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "User not in room" });
    }

    room.members.pull(userId);
    await room.save();

    return res.status(200).json({ success: true, message: "Left the room successfully" });
  } catch (error) {
    console.error("Leave Room Error:", error);
    return res.status(500).json({ success: false, message: "Error leaving room" });
  }
};


