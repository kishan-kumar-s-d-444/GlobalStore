import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { removeAuthUser } from '../../redux/authSlice';

const UseRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useRef();
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

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
        const messagesWithIds = res.data.messages.map(msg => {
          if (!msg._id && msg.id) return { ...msg, _id: msg.id };
          if (!msg._id && !msg.id) {
            return { ...msg, _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          }
          return msg;
        });
        setMessages(messagesWithIds);
      }
    } catch (error) {
      toast.error("Error fetching messages");
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
        toast.error("Error loading room details");
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

    socket.current.on("message", (message) => {
      if (!message._id && message.id) message._id = message.id;
      
      setMessages(prev => {
        if (message._id && !message._id.startsWith('temp-')) {
          const tempMessageIndex = prev.findIndex(msg => 
            msg._id && msg._id.startsWith('temp-') && 
            msg.content === message.content && 
            msg.sender === message.sender
          );
          
          if (tempMessageIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = message;
            return newMessages;
          }
        }
        return [...prev, message];
      });
    });

    socket.current.on("messageDeleted", (deletedMessage) => {
      if (deletedMessage && deletedMessage._id) {
        setMessages((prev) => prev.filter(msg => {
          const msgId = msg._id || msg.id;
          return msgId !== deletedMessage._id;
        }));
      }
      setDeletingMessageId(null);
    });

    socket.current.on("messageError", (error) => {
      toast.error(error.error || "Message error occurred");
      setUploading(false);
      setDeletingMessageId(null);
      if (error.error === "Message not found") fetchMessages();
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

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempMessage = { ...messageData, _id: tempId };
        
        setMessages(prev => [...prev, tempMessage]);
        socket.current.emit("sendMessage", messageData);
        setUploading(false);
        setSelectedFile(null);
      };

      reader.onerror = () => {
        setUploading(false);
        toast.error("Error processing file");
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

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage = { ...messageData, _id: tempId };
      
      setMessages(prev => [...prev, tempMessage]);
      socket.current.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!messageId) return;
    
    setMessages((prev) => prev.filter(msg => {
      const msgId = msg._id || msg.id;
      return msgId !== messageId;
    }));
    setDeletingMessageId(messageId);
    
    socket.current.emit("deleteMessage", { messageId });
    
    setTimeout(() => {
      setDeletingMessageId(null);
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max size is 10MB.");
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

  const handleRoomProfileClick = () => {
    navigate(`/home/profile/${roomId}`);
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room not found</h2>
        <button
          onClick={() => navigate("/home/myrooms")}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Go back to My Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-xl z-30">
        <div className="p-6 flex flex-col gap-2 h-full">
          <div className="text-2xl font-bold text-blue-600 mb-6 text-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-20 mx-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {['Home', 'Search', 'Rooms', 'My Rooms', 'My Gallery', 'My Profile', 'Logout'].map((label, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (label === 'Logout') handleLogout();
                  else if (label === 'Home') navigate('/');
                  else if (label === 'Rooms') navigate('/home/publicrooms');
                  else if (label === 'My Rooms') navigate('/home/myrooms');
                  else if (label === 'My Gallery') navigate('/home/gallery');
                  else if (label === 'My Profile') navigate('/home/profile');
                  else if (label === 'Search') navigate('/home/search');
                }}
                className="w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 mb-2"
              >
                <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center p-4 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 hover:bg-green-800 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div 
            className="flex items-center cursor-pointer hover:bg-green-800 transition-colors rounded-lg p-2"
            onClick={handleRoomProfileClick}
          >
            <img 
              src={room.roomImage} 
              alt={room.roomName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div className="ml-4">
              <h1 className="text-xl font-bold">{room.roomName}</h1>
              <p className="text-sm text-green-100">Created on {formatDate(room.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100"
        >
          <div className="max-w-3l mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-medium mb-1">No messages yet</h3>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const messageId = message._id || message.id;
                  if (!messageId) return null;
                  
                  const isCurrentUser = message.sender === user?.username;
                  
                  return (
                    <div 
                      key={messageId} 
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`relative rounded-xl p-4 max-w-xs md:max-w-md lg:max-w-lg shadow-sm transition-all duration-200 ${
                          isCurrentUser 
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-none" 
                            : "bg-white text-gray-800 rounded-bl-none"
                        } ${deletingMessageId === messageId ? 'opacity-50' : ''}`}
                      >
                        {isCurrentUser && (
                          <button
                            onClick={() => handleDeleteMessage(messageId)}
                            className={`absolute top-2 right-2 p-1 rounded-full ${
                              isCurrentUser ? 'hover:bg-green-700' : 'hover:bg-gray-100'
                            } transition-colors ${deletingMessageId === messageId ? 'cursor-not-allowed' : ''}`}
                            title="Delete message"
                            disabled={deletingMessageId === messageId}
                          >
                            {deletingMessageId === messageId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
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
                              className="rounded-lg max-w-full max-h-64 object-contain cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => window.open(message.content, "_blank")}
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

                        <div className={`flex items-center mt-3 text-xs ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}`}>
                          <span className="font-medium">{message.sender}</span>
                          <span className="mx-2">•</span>
                          <span>{message.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          {selectedFile && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)} 
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
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
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={uploading}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || uploading}
              className={`p-3 rounded-full ${(!newMessage.trim() && !selectedFile) || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                } transition-all transform hover:scale-105`}
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
      </main>
    </div>
  );
};

export default UseRoom;