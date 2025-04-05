import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./CreateRoom.css"; // Custom CSS file

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [roomType, setRoomType] = useState("public");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Current user:", user);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomName || !roomImage) {
      setMessage("Please provide all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("roomImage", roomImage);
    formData.append("roomType", roomType);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/room/createroom",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Room created successfully!");
      setRoomName("");
      setRoomImage(null);
      setRoomType("public");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create room.");
    }
  };

  return (
    <div className="create-room-container">
      <h2>Create a New Room</h2>
      <form onSubmit={handleSubmit} className="room-form">
        <div className="form-group">
          <label>Room Name:</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Room Profile Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRoomImage(e.target.files[0])}
            required
          />
        </div>

        <div className="form-group">
          <label>Room Type:</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            required
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <button type="submit">Create Room</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default CreateRoom;
