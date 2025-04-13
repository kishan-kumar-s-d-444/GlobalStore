import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch} from "react-redux";
import Modal from "react-modal";
import { removeAuthUser } from '../../redux/authSlice';
Modal.setAppElement("#root");

function PublicRooms() {
  const [publicRooms, setPublicRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinedRoomIds, setJoinedRoomIds] = useState([]);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const res = await axios.get("https://sphere-rfkm.onrender.com/api/v1/room/public", {
          withCredentials: true,
        });
        setPublicRooms(res.data.rooms);
        const userId = user?._id;
        const joined = res.data.rooms
          .filter((room) => room.members?.includes(userId))
          .map((room) => room._id);
        setJoinedRoomIds(joined);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching public rooms:", error);
        setLoading(false);
      }
    };
    fetchPublicRooms();
  }, [user]);

  const handleJoinRoom = async (roomId) => {
    try {
      await axios.post(
        `https://sphere-rfkm.onrender.com/api/v1/room/join/${roomId}`,
        {},
        { withCredentials: true }
      );
      setJoinedRoomIds((prev) => [...prev, roomId]);
      setSelectedRoom(null);
      navigate(`/home/room/${roomId}`);
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const filteredRooms = publicRooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* New Sidebar */}
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
                label === 'Rooms' 
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
              <h1 className="text-3xl font-bold text-gray-800">Public Rooms</h1>
              <p className="mt-2 text-gray-600">Explore and join rooms created by other users</p>
            </div>
            <div className="w-96">
              <input
                type="text"
                placeholder="Search public rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg">No rooms match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => {
                    if (!joinedRoomIds.includes(room._id)) {
                      setSelectedRoom(room);
                    }
                  }}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                    joinedRoomIds.includes(room._id)
                      ? 'border-l-4 border-green-500'
                      : 'cursor-pointer hover:border-l-4 hover:border-blue-500'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={room.roomImage}
                      alt={room.roomName}
                      className="w-full h-48 object-cover"
                    />
                    {joinedRoomIds.includes(room._id) && (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Joined
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-1">{room.roomName}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Created by: {room.createdBy?.username || "Unknown"}
                    </p>
                    
                    {joinedRoomIds.includes(room._id) ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/home/chat/${room._id}`);
                          }}
                          className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/home/store/${room._id}`);
                          }}
                          className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Store
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/home/posts/${room._id}`);
                          }}
                          className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Posts
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/home/profile/${room._id}`);
                          }}
                          className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Profile
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinRoom(room._id);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join Room
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Preview Modal */}
        {selectedRoom && (
          <Modal
            isOpen={!!selectedRoom}
            onRequestClose={() => setSelectedRoom(null)}
            contentLabel="Room Preview"
            className="modal-content max-w-md mx-auto mt-20 bg-white rounded-xl shadow-xl outline-none overflow-hidden"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20"
          >
            <div className="relative">
              <img
                src={selectedRoom.roomImage}
                alt={selectedRoom.roomName}
                className="w-full h-56 object-cover"
              />
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedRoom.roomName}</h2>
              <p className="text-gray-600 mb-6">
                Created by: {selectedRoom.createdBy?.username || "Unknown"}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleJoinRoom(selectedRoom._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}

export default PublicRooms;