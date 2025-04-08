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
  const messagesEndRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/message/${roomId}`, {
        withCredentials: true,
      });
      if (res.data.success && res.data.messages) {
        console.log("Fetched messages:", res.data.messages);
        
        // Ensure each message has an _id property
        const messagesWithIds = res.data.messages.map(msg => {
          // Check if the message has an _id or id property
          if (!msg._id && msg.id) {
            return { ...msg, _id: msg.id };
          }
          // If neither _id nor id exists, generate a temporary ID
          if (!msg._id && !msg.id) {
            console.warn("Message missing both _id and id:", msg);
            return { ...msg, _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          }
          return msg;
        });
        
        console.log("Processed messages with IDs:", messagesWithIds);
        setMessages(messagesWithIds);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/room/single/${roomId}`, {
          withCredentials: true,
        });
        if (res.data.success && res.data.room) {
          setRoom(res.data.room);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.emit("joinRoom", roomId);
    console.log("Joined room:", roomId);

    socket.current.on("message", (message) => {
      console.log("New message received:", message);
      // Ensure message has an _id property
      if (!message._id && message.id) {
        message._id = message.id;
      }
      
      // Check if this is a replacement for a temporary message
      setMessages(prev => {
        // If the message has a real ID (not a temporary one)
        if (message._id && !message._id.startsWith('temp-')) {
          // Check if we have a temporary message with the same content and sender
          const tempMessageIndex = prev.findIndex(msg => 
            msg._id && msg._id.startsWith('temp-') && 
            msg.content === message.content && 
            msg.sender === message.sender
          );
          
          if (tempMessageIndex !== -1) {
            // Replace the temporary message with the real one
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = message;
            return newMessages;
          }
        }
        
        // If no temporary message found or this is a new message, add it to the list
        return [...prev, message];
      });
    });

    socket.current.on("messageDeleted", (deletedMessage) => {
      console.log("Message deleted event received:", deletedMessage);
      if (deletedMessage && deletedMessage._id) {
        console.log("Removing message with ID:", deletedMessage._id);
        setMessages((prev) => prev.filter(msg => {
          const msgId = msg._id || msg.id;
          return msgId !== deletedMessage._id;
        }));
      } else {
        console.error("Invalid deletedMessage object:", deletedMessage);
      }
      setDeletingMessageId(null);
    });

    socket.current.on("messageError", (error) => {
      console.error("Message error received:", error);
      setError(error.error);
      setUploading(false);
      setDeletingMessageId(null);
      
      // If the error is "Message not found", we need to refresh the messages
      if (error.error === "Message not found") {
        console.log("Message not found, refreshing messages");
        fetchMessages();
      }
      
      setTimeout(() => setError(null), 5000);
    });

    return () => socket.current.disconnect();
  }, [roomId]);

  const handleSendMessage = () => {
    if (uploading) return;

    if (selectedFile) {
      const file = selectedFile;
      const fileType = file.type.startsWith("video") ? "video" : "image";
      const reader = new FileReader();
      setUploading(true);

      reader.onload = (event) => {
        const mediaUrl = event.target.result;

        const messageData = {
          roomId,
          content: mediaUrl,
          type: fileType,
          sender: user?.username || "You",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Generate a temporary ID for optimistic UI update
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempMessage = { ...messageData, _id: tempId };
        
        // Add the message to the UI immediately
        setMessages(prev => [...prev, tempMessage]);
        
        // Send the message to the server
        socket.current.emit("sendMessage", messageData);
        setUploading(false);
        setSelectedFile(null);
      };

      reader.onerror = () => {
        setUploading(false);
        alert("Error processing file. Please try again.");
      };

      reader.readAsDataURL(file);
    } else if (newMessage.trim()) {
      const messageData = {
        roomId,
        content: newMessage,
        type: "text",
        sender: user?.username || "You",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Generate a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage = { ...messageData, _id: tempId };
      
      // Add the message to the UI immediately
      setMessages(prev => [...prev, tempMessage]);
      
      // Send the message to the server
      socket.current.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  const handleDeleteMessage = (messageId) => {
    console.log("Attempting to delete message with ID:", messageId);
    
    if (!messageId) {
      console.error("Cannot delete message: messageId is missing");
      return;
    }
    
    // Optimistically update UI immediately
    setMessages((prev) => prev.filter(msg => {
      const msgId = msg._id || msg.id;
      return msgId !== messageId;
    }));
    setDeletingMessageId(messageId);
    
    // Emit delete event to server
    socket.current.emit("deleteMessage", { messageId });
    
    // Clear the deleting state after a short delay if no response
    setTimeout(() => {
      setDeletingMessageId(null);
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max size is 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadClick = () => fileInputRef.current.click();
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoBack = () => navigate("/home");

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
          <img src={room.roomImage} alt={room.roomName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white" />
          <div className="ml-4">
            <h1 className="text-xl font-bold">{room.roomName}</h1>
            <p className="text-sm text-green-100">Created on {formatDate(room.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="bg-red-500 text-white p-2 text-center">{error}</div>}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((message) => {
            console.log("Rendering message:", message);
            // Ensure message has an _id property
            const messageId = message._id || message.id;
            if (!messageId) {
              console.error("Message missing ID:", message);
              return null; // Skip rendering messages without IDs
            }
            
            return (
              <div key={messageId}
                className={`flex ${message.sender === user?.username ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative ${message.sender === user?.username ? "bg-green-500 text-white" : "bg-white text-gray-800"} rounded-lg p-3 max-w-xs shadow-sm ${deletingMessageId === messageId ? 'opacity-50' : ''}`}
                >
                  {message.sender === user?.username && (
                    <button
                      onClick={() => handleDeleteMessage(messageId)}
                      className={`absolute top-1 right-1 text-xs text-red-400 hover:text-red-600 ${deletingMessageId === messageId ? 'cursor-not-allowed' : ''}`}
                      title="Delete message"
                      disabled={deletingMessageId === messageId}
                    >
                      {deletingMessageId === messageId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                      ) : (
                        "✖"
                      )}
                    </button>
                  )}

                  {message.type === "text" ? (
                    <p className="break-words">{message.content}</p>
                  ) : message.type === "image" ? (
                    <div className="flex flex-col">
                      <img
                        src={message.content}
                        alt="Message"
                        className="rounded-lg max-w-full max-h-64 object-contain cursor-pointer"
                        onClick={() => {
                          const win = window.open("", "_blank");
                          win.document.write(`
                            <html>
                              <head><title>Image Preview</title></head>
                              <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#000;">
                                <img src="${message.content}" style="max-width:100%; max-height:100%;" />
                              </body>
                            </html>
                          `);
                        }}
                      />
                      <p className="text-xs mt-1 text-center">Click to view full size</p>
                    </div>
                  ) : message.type === "video" ? (
                    <div className="flex flex-col">
                      <video
                        src={message.content}
                        controls
                        className="rounded-lg max-w-full max-h-64"
                      />
                      <p className="text-xs mt-1 text-center">Video message</p>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-70">{message.sender}</p>
                    <p className="text-xs opacity-70">{message.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {selectedFile && (
          <div className="mb-2 text-sm text-gray-700">
            📎 Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            onClick={handleUploadClick}
            className={`mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upload"
            disabled={uploading}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 hover:text-green-500" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={uploading}
          />
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
            className={`ml-4 p-2 rounded-full ${(!newMessage.trim() && !selectedFile) || uploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
              } transition-colors`}
            title="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseRoom;
