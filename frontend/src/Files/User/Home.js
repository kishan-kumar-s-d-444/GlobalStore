import React, { useState } from "react";
import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import CreateRoom from "../Room/CreateRoom"; // Import the CreateRoom component

function Home() {
  const [activeRoom, setActiveRoom] = useState("global");

  const handleRoomChange = (room) => {
    setActiveRoom(room);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Search Bar */}
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4 space-y-2">
          <button
            onClick={() => handleRoomChange("global")}
            className={`w-full px-4 py-2 rounded-lg text-left ${
              activeRoom === "global"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-colors duration-200`}
          >
            Global Rooms
          </button>
          <button
            onClick={() => handleRoomChange("personal")}
            className={`w-full px-4 py-2 rounded-lg text-left ${
              activeRoom === "personal"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-colors duration-200`}
          >
            Personal Rooms
          </button>
        </div>

        {/* Central Content */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {activeRoom === "global" && <GlobalRoom />}
          {activeRoom === "personal" && <PersonalRoom room="Personal Rooms" />}
        </div>
      </div>
    </div>
  );
}

// Global Room Component
function GlobalRoom() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Global Room</h1>
      <p className="mt-2 text-gray-600">Welcome to the Global Room!</p>
    </div>
  );
}

// Personal Room Component
function PersonalRoom({ room }) {
  const navigate = useNavigate(); // Hook for navigation

  const handleCreateRoom = () => {
    navigate("/home/createRoom"); // Redirect to CreateRoom.js
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{room}</h1>
      <p className="mt-2 text-gray-600">Welcome to your {room}!</p>
      <button
        onClick={handleCreateRoom}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Create Room
      </button>
    </div>
  );
}

export default Home;