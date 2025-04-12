import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser, setUser } from '../../redux/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [createdRooms, setCreatedRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: user?.username, email: user?.email, password: '' });
  const [updating, setUpdating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/user/${user._id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(setUser(res.data.user));
      setShowEditModal(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch rooms created by user
      const createdRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/room/myrooms`, {
        withCredentials: true,
      });
      setCreatedRooms(createdRes.data.rooms);

      // Fetch public rooms and filter joined rooms
      const publicRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/room/public`, {
        withCredentials: true,
      });

      const userId = user?._id;
      const joined = publicRes.data.rooms.filter(room =>
        room.members?.includes(userId) && !createdRes.data.rooms.some(cr => cr._id === room._id)
      );

      setJoinedRooms(joined);

      // Fetch purchased products
      const galleryRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/gallery/${user._id}`, {
        withCredentials: true,
      });

      const gallery = galleryRes.data.gallery;
      const formatted = gallery.products.map(item => {
        if (!item.productId) {
          console.warn('Missing productId in gallery item:', item);
          return {
            price: 0,
            purchasedAt: item.purchasedAt || new Date(),
            quantity: item.quantity || 1
          };
        }
        return {
          ...item.productId,
          purchasedAt: item.purchasedAt,
          quantity: item.quantity
        };
      });

      setProducts(formatted);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Spinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  const RoomCard = ({ room }) => (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg flex items-start gap-4">
      <div className="flex-shrink-0">
        {room.roomImage ? (
          <img
            src={room.roomImage}
            alt={room.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            {room.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-indigo-600 truncate">{room.name}</h3>
        <p className="text-gray-600 text-sm mt-1 truncate">{room.description}</p>
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span>Members: {room.members?.length || 0}</span>
          <span className="mx-2">•</span>
          <span>Created: {new Date(room.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <Link
        to={`/home/profile/${room._id}`}
        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm"
      >
        View
      </Link>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg flex items-start gap-4 border border-gray-200">
      <div className="flex-shrink-0">
        {product?.image ? (
          <img
            src={product.image}
            alt={product?.name || 'Product image'}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            {(product?.name?.charAt(0) || 'P').toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-medium truncate ${product?.name ? 'text-blue-600' : 'text-red-600'}`}>
          {product?.name || 'Product Missing'}
        </h3>
        <p className="text-gray-600 text-sm mt-1">Quantity: {product?.quantity || 0}</p>
        <p className="text-gray-600 text-sm">
          Price: ${product?.price?.toFixed(2) || '0.00'}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Purchased: {product?.purchasedAt ? new Date(product.purchasedAt).toLocaleDateString() : 'Unknown date'}
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ title, description, buttonText, buttonLink }) => (
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
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-500">{description}</p>
      {buttonText && (
        <div className="mt-6">
          <Link
            to={buttonLink}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {buttonText}
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
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
                  className={`w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 flex items-center gap-3 ${label === 'My Profile'
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

          {/* Main Content - Wider and better aligned */}
          <div className="ml-80 px-8 py-8 w-full max-w-6xl">
            <div className="space-y-8">
              {/* User Profile Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-inner">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-3xl font-bold text-gray-800">{user?.username}</h1>
                      <p className="text-gray-600 mt-2">{user?.email}</p>
                      <div className="mt-6 flex justify-center sm:justify-start gap-4">
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="px-6 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => navigate('/home/gallery')}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Browse Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rooms Created Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <h2 className="text-2xl font-semibold text-gray-800">Rooms Created</h2>
                    <p className="text-gray-600 mt-1">All the rooms you've created</p>
                  </div>

                  {loading ? (
                    <Spinner />
                  ) : (
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {createdRooms.length > 0 ? (
                        createdRooms.map(room => <RoomCard key={room._id} room={room} />)
                      ) : (
                        <EmptyState
                          title="No rooms created yet"
                          description="Get started by creating your first room!"
                          buttonText="Create Room"
                          buttonLink="/home/createroom"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Rooms Joined Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <h2 className="text-2xl font-semibold text-gray-800">Rooms Joined</h2>
                    <p className="text-gray-600 mt-1">All the rooms you've joined</p>
                  </div>

                  {loading ? (
                    <Spinner />
                  ) : (
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {joinedRooms.length > 0 ? (
                        joinedRooms.map(room => <RoomCard key={room._id} room={room} />)
                      ) : (
                        <EmptyState
                          title="No rooms joined yet"
                          description="Join public rooms to start collaborating!"
                          buttonText="Browse Rooms"
                          buttonLink="/home/search"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Products Purchased Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Products Purchased</h2>
                    <p className="text-gray-600 mt-1">All the products you've purchased</p>
                  </div>
                  <button
                    onClick={() => navigate('/home/gallery')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                  >
                    Browse Gallery
                  </button>
                </div>

                {loading ? (
                  <Spinner />
                ) : (
                  <div className="divide-y divide-gray-200">
                    {products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {products.map(product => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No products purchased yet"
                        description="Your purchased products will appear here"
                        buttonText="Browse Products"
                        buttonLink="/home/publicrooms"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-70"
              >
                {updating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;