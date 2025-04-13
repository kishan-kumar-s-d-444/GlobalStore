import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../redux/authSlice';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'


const Landing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentModalPost, setCommentModalPost] = useState(null);
  const [publicRooms, setPublicRooms] = useState([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchAllPosts();
      fetchPublicRooms();
    }
  }, [user]);

  const fetchAllPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/post/all`, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPosts(res.data);
    } catch (err) {
      setError('Failed to fetch posts');
      if (err.response?.status === 401) {
        // If unauthorized, redirect to login
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/room/public`, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPublicRooms(res.data.rooms);
      const userId = user?._id;
      const joined = res.data.rooms.filter(room => room.members?.includes(userId)).map(room => room._id);
      setJoinedRoomIds(joined);
    } catch (err) {
      console.error("Error fetching public rooms:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/room/join/${roomId}`, {}, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchPublicRooms();
      fetchAllPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/post/${postId}/like`,
        { userId: user._id },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setPosts(posts.map(post =>
        post._id === postId
          ? {
            ...post,
            likedBy: post.likedBy.includes(user._id)
              ? post.likedBy.filter(id => id !== user._id)
              : [...post.likedBy, user._id],
          }
          : post
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/post/${postId}/comment`,
        { userId: user._id, content },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const updatedPosts = posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...post.comments, res.data] }
          : post
      );
      setPosts(updatedPosts);

      if (commentModalPost && commentModalPost._id === postId) {
        setCommentModalPost({
          ...commentModalPost,
          comments: [...commentModalPost.comments, res.data],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`https://sphere-rfkm.onrender.com/api/v1/post/${postId}/comment/${commentId}`, {
        data: { userId: user._id },
        withCredentials: true,
      });

      const updatedPosts = posts.map(post =>
        post._id === postId
          ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
          : post
      );
      setPosts(updatedPosts);

      if (commentModalPost && commentModalPost._id === postId) {
        setCommentModalPost({
          ...commentModalPost,
          comments: commentModalPost.comments.filter(c => c._id !== commentId),
        });
      }
    } catch (err) {
      console.error("Delete comment error", err);
    }
  };

  const handleLogout = () => {
    // Clear state first
    setPosts([]);
    setPublicRooms([]);
    setJoinedRoomIds([]);
    setCommentModalPost(null);
    
    // Then dispatch and navigate
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    
    // Use setTimeout to ensure React finishes current render cycle
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  // Shuffle array and pick first 3 rooms
  const getRandomRooms = (rooms, count = 3) => {
    const shuffled = [...rooms].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomPublicRooms = getRandomRooms(publicRooms);


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col gap-2">
        <div className="text-2xl font-bold text-blue-600 mb-8 text-center">
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
            className={`w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600${
              label === 'Home'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
            <span>{label}</span>
          </button>
        ))}
      </aside>

      {/* Main content + Right Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto">
        {/* Main Feed */}
        <main className="flex-1 px-4 py-6 lg:pr-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found. Join some rooms to see posts.</p>
                <button
                  onClick={() => navigate('/home')}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Explore Rooms
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => navigate(`/home/profile/${post.roomId._id}`)}
                    >
                      {post.roomId.roomImage ? (
                        <img
                          src={post.roomId.roomImage}
                          alt={post.roomId.roomName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {post.roomId.roomName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-800">{post.roomId.roomName}</h3>
                    </div>
                    {!post.roomId.members.includes(user._id) && (
                      <button
                        onClick={() => handleJoinRoom(post.roomId._id)}
                        className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg"
                      >
                        Join Room
                      </button>
                    )}
                  </div>
                  <p className="mb-4 text-gray-700">{post.content}</p>
                  {post.type === 'image' && (
                    <img src={post.fileUrl} className="rounded-lg w-full mb-4 border" />
                  )}
                  {post.type === 'video' && (
                    <video controls className="w-full rounded-lg mb-4 border">
                      <source src={post.fileUrl} type="video/mp4" />
                    </video>
                  )}
                  <div className="flex justify-between items-center mt-4 text-sm border-t pt-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1"
                    >
                      <FontAwesomeIcon
                        icon={post.likedBy.includes(user._id) ? solidHeart : regularHeart}
                        className={`text-lg cursor-pointer ${post.likedBy.includes(user._id) ? 'text-red-500' : 'text-gray-400'
                          }`}
                      />

                      <span>{post.likedBy.length}</span>
                    </button>
                    <button
                      onClick={() => setCommentModalPost(post)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                    >
                      💬 <span>{post.comments.length} comments</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <div className="w-96 hidden lg:flex flex-col mr-4">
          {/* User Profile Section */}
          <aside className="bg-gradient-to-br from-purple-100 to-purple-200 border-l border-b border-purple-300 rounded-lg shadow-md mt-6 p-6 mx-2">
            <div
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => navigate('/home/profile')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 text-lg">{user?.username}</span>
                  <p className="text-sm text-gray-500">View Profile</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Gap between profile and rooms */}
          <div className="h-12" />

          {/* Public Rooms Section */}
          <aside className="bg-white border-l border-gray-200 p-6 mx-2 rounded-lg shadow-sm" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Discover Public Rooms</h3>
            <div className="space-y-3">
              {randomPublicRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                  onClick={() => navigate(`/home/profile/${room._id}`)}
                >
                  <div className="flex items-center gap-3">
                    {room.roomImage ? (
                      <img src={room.roomImage} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {room.roomName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{room.roomName}</p>
                      <p className="text-xs text-gray-500">{room.members?.length || 0} members</p>
                    </div>
                  </div>
                  {!joinedRoomIds.includes(room._id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(room._id);
                      }}
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                    >
                      Join
                    </button>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Joined</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>



      </div>

      {/* Comment Modal */}
      {commentModalPost && (
        <div className="fixed top-0 right-0 w-[450px] h-full bg-white border-l shadow-lg flex flex-col z-50">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Comments</h3>
            <button
              onClick={() => setCommentModalPost(null)}
              className="text-gray-500 hover:text-red-500 text-xl"
            >
              ✖
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {commentModalPost.comments.map((c, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                    {c.userId.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-gray-800">{c.userId.username}</p>
                </div>
                <p className="text-sm text-gray-700 pl-8">{c.content}</p>
                {c.userId._id === user._id && (
                  <button
                    onClick={() => handleDeleteComment(c._id, commentModalPost._id)}
                    className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const content = e.target.comment.value.trim();
              if (content) {
                handleComment(commentModalPost._id, content);
                e.target.comment.value = '';
              }
            }}
            className="p-4 border-t flex gap-2 sticky bottom-0 bg-white"
          >
            <input
              name="comment"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Landing;
