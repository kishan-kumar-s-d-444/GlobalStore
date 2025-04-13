import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "react-modal";

Modal.setAppElement("#root");

function Home() {
  const [activeRoom, setActiveRoom] = useState("global");
  const navigate = useNavigate();
  const handleRoomChange = (room) => {
    setActiveRoom(room);
  };

  return (
    <div className="flex flex-col h-screen">
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

          <button
            onClick={() => navigate("/home/gallery")}
            className="w-full px-4 py-2 rounded-lg text-center bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 shadow-md"
          >
            My Gallery
          </button>

          <button
            onClick={() => navigate("/")}
            className={`w-full px-4 py-2 rounded-lg text-center bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-md`}
          >
            Home
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
  const [publicRooms, setPublicRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinedRoomIds, setJoinedRoomIds] = useState([]);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  // console.log("KISHAN KUMAR SD says",user._id)
  // console.log("KISHAN KUMAR SD says",user.username)

  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const res = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/room/public`, {
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Global Rooms</h1>
      <p className="mt-2 text-gray-600">Explore rooms created by other users!</p>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search public rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-1/2 focus:outline-none"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading public rooms...</p>
        ) : filteredRooms.length === 0 ? (
          <p className="text-gray-500">No rooms match your search.</p>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              onClick={() => {
                if (!joinedRoomIds.includes(room._id)) {
                  setSelectedRoom(room);
                }
              }}
              className={`bg-white shadow-md rounded-lg p-4 flex flex-col items-center transition-shadow duration-200 relative ${
                joinedRoomIds.includes(room._id)
                  ? "cursor-default hover:shadow-lg"
                  : "cursor-pointer hover:ring-2 hover:ring-blue-400"
              }`}
            >
              <img
                src={room.roomImage}
                alt={room.roomName}
                className="w-32 h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-semibold">{room.roomName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Created by: {room.createdBy?.username || "Unknown"}
              </p>
              
              {joinedRoomIds.includes(room._id) && (
                <>
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Joined
                  </span>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                    <button
                      onClick={() => navigate(`/home/room/${room._id}`)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => navigate(`/home/store/${room._id}`)}
                      className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                    >
                      Store
                    </button>
                    <button
                      onClick={() => navigate(`/home/posts/${room._id}`)}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                    >
                      Post
                    </button>
                    <button
                      onClick={() => navigate(`/home/profile/${room._id}`)}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                    >
                      Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onRequestClose={() => setSelectedRoom(null)}
          contentLabel="Room Preview"
          className="max-w-md mx-auto mt-20 bg-white p-6 rounded-lg shadow-lg outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
        >
          <h2 className="text-xl font-bold mb-2">{selectedRoom.roomName}</h2>
          <img
            src={selectedRoom.roomImage}
            alt={selectedRoom.roomName}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-600 mb-4">
            Created by: {selectedRoom.createdBy?.username || "Unknown"}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            {!joinedRoomIds.includes(selectedRoom._id) && (
              <button
                onClick={() => handleJoinRoom(selectedRoom._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Join Room
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Personal Room Component
function PersonalRoom({ room }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCreateRoom = () => {
    navigate("/home/createRoom");
  };

  const convertToPublic = async (roomId) => {
    try {
      await axios.patch(
        `https://sphere-rfkm.onrender.com/api/v1/room/${roomId}/make-public`,
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

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(
        `https://sphere-rfkm.onrender.com/api/v1/room/${roomId}`,
        { withCredentials: true }
      );
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/room/myrooms`, {
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{room}</h1>
      <p className="mt-2 text-gray-600">Welcome to your {room}!</p>

      <button
        onClick={handleCreateRoom}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Create Room
      </button>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500">You haven't created any rooms yet.</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center relative"
            >
              <img
                src={room.roomImage}
                alt={room.roomName}
                className="w-32 h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-semibold">{room.roomName}</h3>
              <p className="text-sm text-gray-500 mb-2 capitalize">Type: {room.roomType}</p>

              {room.roomType === "private" && (
                <button
                  onClick={() => convertToPublic(room._id)}
                  className="text-xs px-2 py-1 bg-yellow-500 text-white rounded mb-1 hover:bg-yellow-600"
                >
                  Convert to Public
                </button>
              )}

              <button
                onClick={() => deleteRoom(room._id)}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Room
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => navigate(`/home/room/${room._id}`)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Chat
                </button>
                <button
                  onClick={() => navigate(`/home/profile/${room._id}`)}
                  className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate(`/home/addproduct/${room._id}`)}
                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                >
                  addproduct
                </button>
                <button
                  onClick={() => navigate(`/home/products/${room._id}`)}
                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={() => navigate(`/home/addpost/${room._id}`)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Add Post
                </button>
                <button
                  onClick={() => navigate(`/home/posts/${room._id}`)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Post
                </button>
                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;