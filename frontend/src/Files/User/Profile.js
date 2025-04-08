import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/room/myrooms", {
        withCredentials: true,
      });
      setRooms(res.data.rooms);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Simple spinner component
  const Spinner = () => (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg">
          <div className="p-8">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user?.username}</h1>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-2">User ID: {user?._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Created Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Rooms Created</h2>
            <p className="text-gray-600 mt-1">All the rooms you've created</p>
          </div>
          
          {loading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-indigo-600">{room.name}</h3>
                        <p className="text-gray-600 mt-1">{room.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>Created: {new Date(room.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{room.members.length} members</span>
                        </div>
                      </div>
                      <Link 
                        to={`/home/room/${room._id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                      >
                        View Room
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No rooms created yet</h3>
                  <p className="mt-1 text-gray-500">Get started by creating your first room!</p>
                  <div className="mt-6">
                    <Link
                      to="/create-room"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Room
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;