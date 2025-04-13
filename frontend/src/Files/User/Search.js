import React, { useEffect, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../../redux/authSlice';
const Search = () => {
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://sphere-rfkm.onrender.com/api/v1/room/public", { 
          withCredentials: true 
        });
        
        console.log("API Response:", response.data); // Debug log
        
        const roomsData = response.data.rooms || response.data.data || response.data;
        
        if (Array.isArray(roomsData)) {
          setRooms(roomsData);
          setFilteredRooms(roomsData);
        } else {
          console.error("Unexpected response format - expected array:", roomsData);
          setRooms([]);
          setFilteredRooms([]);
        }
      } catch (error) {
        console.error("Error fetching public rooms:", error);
        setRooms([]);
        setFilteredRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicRooms();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRooms(rooms);
      return;
    }

    const results = rooms.filter(room => {
      const nameMatch = room?.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = room?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || descMatch;
    });

    setFilteredRooms(results);
  }, [searchTerm, rooms]);

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  const RoomCard = ({ room }) => {
    // const isMember = room.members?.some(member => member._id === user?._id);
    console.log("Room members:", room.members);
    console.log("Current user ID:", user?._id);
    
    const isMember = room.members?.some(member => {
      console.log("Checking member:", member, "against user:", user?._id);
      return member=== user?._id;
    });
    
    console.log("Is user a member?", isMember);
    return (
      <div 
        className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
        onClick={() => navigate(`/home/profile/${room._id}`)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {room.roomImage ? (
              <img
                src={room.roomImage}
                alt={room.roomName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {room.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800">
              {room.roomName || 'Unnamed Room'}
            </h3>
            <div className="mt-3 flex items-center text-xs text-gray-400">
              <span>👥 {room.members?.length || 0} members</span>
              <span className="mx-2">•</span>
              <span>🕒 Created {new Date(room.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            to={`/room/${room._id}`}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              isMember 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
            onClick={(e) => {
              if (isMember) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {isMember ? 'Already Joined' : 'Join Room'}
          </Link>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="p-8 text-center bg-white rounded-xl border border-gray-100">
      <svg
        className="mx-auto h-12 w-12 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-700">No public rooms found</h3>
      <p className="mt-1 text-gray-400">
        {searchTerm 
          ? "No public rooms match your search"
          : loading ? "Loading..." : "There are currently no public rooms available"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
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
                label === 'Search'
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
        <div className="ml-80 flex-1 px-8 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Public Rooms</h1>
            <p className="text-gray-500">Search and join public rooms</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search public rooms by name or description..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {searchTerm ? 'Search Results' : 'All Public Rooms'}
              </h2>
              <span className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${filteredRooms.length} ${filteredRooms.length === 1 ? 'room' : 'rooms'} found`}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map(room => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;