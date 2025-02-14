import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making API requests

function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [externalLinks, setExternalLinks] = useState("");
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user data is stored in localStorage after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("description", description);
    formData.append("externalLinks", externalLinks);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    try {
      const response = await axios.post("/api/rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`, // Include the user's token for authentication
        },
      });

      alert("Room created successfully!");
      navigate("/"); // Redirect back to Home after submission
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Room</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Photo
          </label>
          <input
            type="file"
            onChange={(e) => setProfilePhoto(e.target.files[0])}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
        </div>

        {/* External Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            External Links
          </label>
          <input
            type="text"
            value={externalLinks}
            onChange={(e) => setExternalLinks(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com, https://anotherlink.com"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRoom;