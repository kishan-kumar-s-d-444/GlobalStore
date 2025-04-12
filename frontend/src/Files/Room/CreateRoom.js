import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { removeAuthUser } from '../../redux/authSlice';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [roomType, setRoomType] = useState("public");
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Current user:", user);
  }, []);

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomName || !roomImage) {
      toast.error("Please provide all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("roomImage", roomImage);
    formData.append("roomType", roomType);

    try {
      const loadingToast = toast.loading("Creating room...");
      
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/room/createroom`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.dismiss(loadingToast);
      toast.success("Room created successfully!");
      
      setRoomName("");
      setRoomImage(null);
      setPreviewImage(null);
      setRoomType("public");
      navigate("/home/myrooms");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create room.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-md overflow-y-auto z-30">
        <div className="p-6 flex flex-col gap-2">
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <h1 className="text-3xl font-bold">Create a New Room</h1>
              <p className="mt-2 opacity-90">Build your community space</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter room name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-colors">
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs mt-1">Upload Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Recommended size: 500x500px</p>
                      <p>Formats: JPG, PNG, GIF</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                      roomType === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="roomType"
                        value="public"
                        checked={roomType === 'public'}
                        onChange={() => setRoomType('public')}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Public</span>
                        <span className="text-xs text-gray-500 mt-1">Anyone can join</span>
                      </div>
                    </label>
                    <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                      roomType === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="roomType"
                        value="private"
                        checked={roomType === 'private'}
                        onChange={() => setRoomType('private')}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Private</span>
                        <span className="text-xs text-gray-500 mt-1">Invite only</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-[1.01]"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateRoom;