import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [creator, setCreator] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // Fetch room details
        const roomRes = await axios.get(`http://localhost:5000/api/v1/room/single/${roomId}`, {
          withCredentials: true,
        });
        
        if (roomRes.data.success && roomRes.data.room) {
          const roomData = roomRes.data.room;
          setRoom(roomData);

          // Fetch creator details
          if (roomData.createdBy) {
            const creatorRes = await axios.get(`http://localhost:5000/api/v1/user/${roomData.createdBy}`, {
              withCredentials: true,
            });
            if (creatorRes.data.success) {
              setCreator(creatorRes.data.data);
            }
          }

          // Fetch member details
          if (roomData.members && roomData.members.length > 0) {
            const memberPromises = roomData.members.map(memberId => 
              axios.get(`http://localhost:5000/api/v1/user/${memberId}`, {
                withCredentials: true,
              })
            );
            
            const membersRes = await Promise.all(memberPromises);
            const membersData = membersRes.map(res => res.data.success ? {
              ...res.data.data,
              isAdmin: res.data.data._id === roomData.createdBy
            } : null);
            setMembers(membersData.filter(Boolean));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Room not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Room Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <img 
                src={room.roomImage} 
                alt={room.roomName}
                className="w-20 h-20 rounded-full border-4 border-white shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold">{room.roomName}</h1>
                <p className="text-blue-100 capitalize">{room.roomType} room</p>
                {creator && (
                  <p className="text-blue-100 mt-1">
                    Created by: <span className="font-semibold">{creator.username}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between gap-2">
            <button
              onClick={() => navigate(`/home/room/${room._id}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex-1 sm:flex-none"
            >
              Room Chat
            </button>
            <button
              onClick={() => navigate(`/home/products/${room._id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex-1 sm:flex-none"
            >
              Room Products
            </button>
          </div>

          {/* Room Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Information</h2>
                <div className="space-y-3">
                  <p className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-gray-600">Created on: {new Date(room.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-600">Members: {members.length}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">Last updated: {new Date(room.updatedAt).toLocaleString()}</p>
                  <p className="text-gray-600">Room ID: {room._id}</p>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Members</h2>
              {members.length === 0 ? (
                <p className="text-gray-500">No members in this room</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {members.map((member, index) => (
                    <div key={index} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg relative">
                      {member.isAdmin && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          ADMIN
                        </span>
                      )}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
                        member.isAdmin ? 'bg-blue-500' : 'bg-indigo-300'
                      }`}>
                        {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="mt-2 text-sm text-gray-600 truncate w-full text-center font-medium">
                        {member.username || 'Unknown User'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRoom;