import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart, faComment } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { removeAuthUser } from '../../redux/authSlice';

const ProfileRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [room, setRoom] = useState(null);
  const [creator, setCreator] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const isMember = members.some((member) => member?._id === user?._id);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data: roomRes } = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/room/single/${roomId}`, {
          withCredentials: true,
        });

        if (roomRes.success && roomRes.room) {
          const roomData = roomRes.room;
          setRoom(roomData);

          if (roomData.createdBy) {
            const { data: creatorRes } = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/user/${roomData.createdBy}`, {
              withCredentials: true,
            });
            if (creatorRes.success) {
              setCreator(creatorRes.data);
            }
          }

          if (roomData.members?.length > 0) {
            const memberPromises = roomData.members.map((memberId) =>
              axios.get(`https://sphere-rfkm.onrender.com/api/v1/user/${memberId}`, { withCredentials: true })
            );

            const membersRes = await Promise.all(memberPromises);
            const membersData = membersRes.map((res) =>
              res.data.success
                ? {
                  ...res.data.data,
                  isAdmin: res.data.data._id === roomData.createdBy,
                }
                : null
            );
            setMembers(membersData.filter(Boolean));
          }

          const { data: postRes } = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/post/room/${roomId}`, {
            withCredentials: true,
          });
          setPosts(postRes);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load room details');
        toast.error('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  const handleJoinRoom = async () => {
    try {
      await axios.post(`https://sphere-rfkm.onrender.com/api/v1/room/join/${roomId}`, {}, { withCredentials: true });
      toast.success('Successfully joined the room!');
      window.location.reload();
    } catch (err) {
      console.error('Failed to join room:', err);
      toast.error(err.response?.data?.message || 'Failed to join room');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const response = await axios({
        method: 'delete',
        url: `https://sphere-rfkm.onrender.com/api/v1/room/${roomId}/leave`,
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Successfully left the room');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to leave room:', err);
      toast.error(err.response?.data?.message || 'Failed to leave room');
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `https://sphere-rfkm.onrender.com/api/v1/post/${postId}/like`,
        { userId: user._id },
        { withCredentials: true }
      );
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              likedBy: post.likedBy.includes(user._id)
                ? post.likedBy.filter((id) => id !== user._id)
                : [...post.likedBy, user._id],
            }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to like post');
    }
  };

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
};

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
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
    <div className="flex flex-col md:flex-row">
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
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600"
                >
                  <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-80 px-6 py-10 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Room Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <img
                src={room.roomImage}
                alt={room.roomName}
                className="w-20 h-20 rounded-full border-4 border-white shadow-md"
              />
              <div>
                <h1 className="text-3xl font-bold">{room.roomName}</h1>
                <p className="capitalize text-blue-100">{room.roomType} room</p>
                {creator && (
                  <p className="mt-1 text-blue-100">
                    Created by: <span className="font-semibold">{creator.username}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex gap-4 flex-wrap">
            {isMember ? (
              <>
                <button
                  onClick={() => navigate(`/home/chat/${room._id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Room Chat
                </button>
                <button
                  onClick={() => navigate(`/home/store/${room._id}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Room Products
                </button>
                {creator?._id !== user?._id && (
                  <button
                    onClick={handleLeaveRoom}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Leave Room
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Join Room
              </button>
            )}
          </div>

          {/* Room Content */}
          <div className={`p-6 ${!isMember ? 'opacity-50 pointer-events-none select-none' : ''}`}>
            {/* Room Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Information</h2>
                <p className="text-gray-600 mb-1">
                  Created on: {new Date(room.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600">Members: {members.length}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h2>
                <p className="text-gray-600 mb-1">
                  Last updated: {new Date(room.updatedAt).toLocaleString()}
                </p>
                {/* <p className="text-gray-600">Room ID: {room._id}</p> */}
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
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${member.isAdmin ? 'bg-blue-500' : 'bg-indigo-400'
                        }`}>
                        {member.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="mt-2 text-sm text-center font-medium text-gray-700 truncate w-full">
                        {member.username || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-500">No posts yet in this room.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openPostModal(post)}
                    >
                      {post.content && <p className="text-gray-700 mb-2 line-clamp-3">{post.content}</p>}

                      {post.type === 'image' && post.fileUrl && (
                        <img
                          src={post.fileUrl}
                          alt="Post"
                          className="rounded-lg w-full h-48 object-cover border"
                        />
                      )}

                      {post.type === 'video' && post.fileUrl && (
                        <video className="rounded-lg w-full h-48 object-cover border">
                          <source src={post.fileUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}

                      <div className="flex justify-between items-center mt-4 text-sm border-t pt-3">
                        <div
                          className="flex items-center gap-1 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post._id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={post.likedBy.includes(user._id) ? solidHeart : regularHeart}
                            className={`text-lg group-hover:scale-110 transition-transform ${post.likedBy.includes(user._id) ? 'text-red-500' : 'text-gray-400'
                              }`}
                          />
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`Liked by ${post.likedBy.length} people`}
                          >
                            {post.likedBy.length}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostModal(post);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faComment}
                            className="text-lg text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform"
                          />
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`${post.comments?.length || 0} comments`}
                          >
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Post Details</h3>
                <button
                  onClick={closePostModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedPost.content && (
                <p className="text-gray-700 mb-4 whitespace-pre-line">{selectedPost.content}</p>
              )}

              {selectedPost.type === 'image' && selectedPost.fileUrl && (
                <img
                  src={selectedPost.fileUrl}
                  alt="Post"
                  className="rounded-lg w-full max-h-96 object-contain border"
                />
              )}

              {selectedPost.type === 'video' && selectedPost.fileUrl && (
                <video controls className="rounded-lg w-full max-h-96 object-contain border">
                  <source src={selectedPost.fileUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className="flex items-center gap-1"
                  >
                    <FontAwesomeIcon
                      icon={selectedPost.likedBy.includes(user._id) ? solidHeart : regularHeart}
                      className={`text-xl ${selectedPost.likedBy.includes(user._id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                    />
                    <span>{selectedPost.likedBy.length} likes</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <FontAwesomeIcon icon={faComment} />
                  <span>{selectedPost.comments?.length || 0} comments</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Comments</h4>
                {selectedPost.comments?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPost.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium">{comment.userId?.username || 'Unknown'}</span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileRoom;