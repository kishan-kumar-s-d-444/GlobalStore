import { Room } from "../models/room.model.js";

export const createroom = async (req, res) => {
  const { roomName, description, externalLinks } = req.body;
  const profilePhoto = req.file ? req.file.path : '';
  const createdBy = req.user._id;

  try {
    const newRoom = new Room({
      roomName,
      description,
      profilePhoto,
      externalLinks: externalLinks.split(',').map(link => link.trim()), // Convert comma-separated string to array
      createdBy,
    });

    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully!', room: newRoom });
  } 
  catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

export const getallrooms = async (req, res) => {
    const { userId } = req.query; 
    try {
      const filter = userId ? { createdBy: userId } : {};
      const rooms = await Room.find(filter).populate('createdBy', 'username email'); 
      res.status(200).json({ rooms });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
  };