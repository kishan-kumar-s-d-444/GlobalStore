import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";

const UseRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useRef();
  const fileInputRef = useRef();

  const { user } = useSelector((state) => state.auth); // ✅ Redux user
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/room/single/${roomId}`,
          { withCredentials: true }
        );
        if (res.data.success && res.data.room) {
          setRoom(res.data.room);
        } else {
          console.error("Failed to fetch room data:", res.data);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.emit("joinRoom", roomId);

    socket.current.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        roomId,
        content: newMessage,
        type: "text",
        sender: user?.username || "You", // ✅ Uses Redux user
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.current.emit("sendMessage", messageData);
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith("video") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/${fileType}/upload`,
        formData
      );
      const mediaUrl = res.data.secure_url;

      const messageData = {
        roomId,
        content: mediaUrl,
        type: fileType,
        sender: user?.username || "You", // ✅ Uses Redux user
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.current.emit("sendMessage", messageData);
      setMessages((prev) => [...prev, messageData]);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room not found</h2>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Go back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 bg-green-600 text-white shadow-md">
        <button onClick={handleGoBack} className="mr-4 p-2 hover:bg-green-700 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex items-center">
          <img
            src={room.roomImage}
            alt={room.roomName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
          />
          <div className="ml-4">
            <h1 className="text-xl font-bold">{room.roomName}</h1>
            <p className="text-sm text-green-100">Created on {formatDate(room.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === user?.username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  message.sender === user?.username
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800"
                } rounded-lg p-3 max-w-xs shadow-sm`}
              >
                {message.type === "text" ? (
                  <p className="break-words">{message.content}</p>
                ) : message.type === "image" ? (
                  <img
                    src={message.content}
                    alt="Message"
                    className="rounded-lg max-w-full max-h-64 object-contain"
                  />
                ) : message.type === "video" ? (
                  <video
                    src={message.content}
                    controls
                    className="rounded-lg max-w-full max-h-64"
                  />
                ) : null}
                <p className="text-xs mt-1 opacity-70">{message.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 flex items-center bg-white">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button onClick={handleUploadClick} className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500 hover:text-green-500" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UseRoom;
