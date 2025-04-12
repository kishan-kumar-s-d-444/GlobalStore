import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {useDispatch } from 'react-redux';
import Modal from "react-modal";
import { removeAuthUser } from '../../redux/authSlice';

Modal.setAppElement("#root");

function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateRoom = () => {
    navigate("/home/createRoom");
  };

  const convertToPublic = async (roomId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/room/${roomId}/make-public`,
        {},
        { withCredentials: true }
      );
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId ? { ...room, roomType: "public" } : room
        )
      );
    } catch (error) {
      console.error("Error converting to public:", error);
    }
  };

  const confirmDelete = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const deleteRoom = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/v1/room/${roomToDelete._id}`,
        { withCredentials: true }
      );
      setRooms((prev) => prev.filter((room) => room._id !== roomToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  useEffect(() => {
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

    fetchRooms();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-md overflow-y-auto z-30">
        <div className="p-6 flex flex-col gap-2">
          <div className="text-2xl font-bold text-blue-600 mb-6 text-center">
            <img src="/logo.png" alt="Logo" className="h-20 mx-auto rounded-lg" />
          </div>
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
              className={`w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                label === 'My Rooms'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Rooms</h1>
              <p className="mt-2 text-gray-600">Manage your personal rooms and communities</p>
            </div>
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Room
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">You haven't created any rooms yet.</p>
              <button
                onClick={handleCreateRoom}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-blue-500">
                  <div className="relative">
                    <img
                      src={room.roomImage}
                      alt={room.roomName}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full capitalize">
                      {room.roomType}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-1">{room.roomName}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        Members: {room.members?.length || 0}
                      </span>
                      {room.roomType === 'private' && (
                        <button
                          onClick={() => convertToPublic(room._id)}
                          className="text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                          Make Public
                        </button>
                      )}
                    </div>

                    {/* Updated Buttons */}
                    <div className="space-y-3 mb-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/home/chat/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition"
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={() => navigate(`/home/profile/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-yellow-500 text-white text-sm rounded-full hover:bg-yellow-600 transition"
                        >
                          👤 Profile
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/home/addproduct/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition"
                        >
                          ➕ Add Product
                        </button>
                        <button
                          onClick={() => navigate(`/home/products/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition"
                        >
                          📦 Products
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/home/addpost/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition"
                        >
                          ➕ Add Post
                        </button>
                        <button
                          onClick={() => navigate(`/home/posts/${room._id}`)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition"
                        >
                          📝 Posts
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => confirmDelete(room)}
                      className="w-full px-4 py-2 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={() => setIsDeleteModalOpen(false)}
          contentLabel="Delete Room Confirmation"
          className="modal-content max-w-md mx-auto mt-20 bg-white rounded-xl shadow-xl outline-none overflow-hidden"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the room "{roomToDelete?.roomName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteRoom}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Room
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

export default MyRooms;
