import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { removeAuthUser } from '../../redux/authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-hot-toast';

const Posts = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentModalPost, setCommentModalPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [roomDetails, setRoomDetails] = useState({
    roomName: '',
    roomImage: '',
    members: []
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch room details
        const roomRes = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/room/single/${roomId}`, {
          withCredentials: true
        });
        setRoomDetails(roomRes.data || {
          roomName: 'Unknown Room',
          roomImage: '',
          members: []
        });

        // Fetch posts
        const postsRes = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/post/room/${roomId}`, {
          withCredentials: true
        });
        setPosts(postsRes.data.map(post => ({
          ...post,
          userId: post.userId || { username: 'Unknown' },
          likedBy: post.likedBy || [],
          comments: post.comments || []
        })));
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `https://sphere-rfkm.onrender.com/api/v1/post/${postId}/like`,
        { userId: user._id },
        { withCredentials: true }
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
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const res = await axios.post(
        `https://sphere-rfkm.onrender.co/api/v1/post/${postId}/comment`,
        { userId: user._id, content },
        { withCredentials: true }
      );
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...post.comments, res.data] }
          : post
      ));

      if (commentModalPost && commentModalPost._id === postId) {
        setCommentModalPost({
          ...commentModalPost,
          comments: [...commentModalPost.comments, res.data],
        });
      }
      setCommentContent('');
      toast.success('Comment added!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`https://sphere-rfkm.onrender.com/api/v1/post/${postId}/comment/${commentId}`, {
        data: { userId: user._id },
        withCredentials: true,
      });

      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
          : post
      ));

      if (commentModalPost && commentModalPost._id === postId) {
        setCommentModalPost({
          ...commentModalPost,
          comments: commentModalPost.comments.filter(c => c._id !== commentId),
        });
      }
      toast.success('Comment deleted');
    } catch (err) {
      console.error("Delete comment error", err);
      toast.error('Failed to delete comment');
    }
  };

  const handleLogout = () => {
    dispatch(removeAuthUser());
    localStorage.removeItem('token');
    navigate('/login');
  };


  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col gap-2 sticky top-0 h-screen">
          {/* Sidebar skeleton */}
          <div className="text-2xl font-bold text-blue-600 mb-8 text-center">
            <div className="h-20 w-20 mx-auto rounded-lg bg-gray-200"></div>
          </div>
          {[...Array(7)].map((_, idx) => (
            <div key={idx} className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col gap-2 sticky top-0 h-screen">
          {/* Sidebar skeleton */}
          <div className="text-2xl font-bold text-blue-600 mb-8 text-center">
            <div className="h-20 w-20 mx-auto rounded-lg bg-gray-200"></div>
          </div>
          {[...Array(7)].map((_, idx) => (
            <div key={idx} className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Made sticky */}
      <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col gap-2 sticky top-0 h-screen overflow-y-auto">
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
            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600"
          >
            <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
            <span>{label}</span>
          </button>
        ))}
      </aside>

      {/* Main Content - Reduced gap from sidebar */}
      <main className="flex-1 p-4 pl-20 overflow-y-auto">
        <div className="max-w-3xl">
          {/* Room Header - Similar to Landing.js */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 cursor-pointer"
            onClick={() => navigate(`/home/profile/${roomId}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {roomDetails.room.roomImage ? (
                  <img
                    src={roomDetails.room.roomImage}
                    alt={roomDetails.room.roomName || 'Room'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {(roomDetails.room.roomName || 'R').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{roomDetails.room.roomName || 'Unknown Room'}</h2>
                  <p className="text-gray-500 text-sm">{roomDetails.room.members?.length || 0} members</p>
                </div>
              </div>
              <button
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/home/profile/${roomId}`);
                }}
              >
                View Room
              </button>
            </div>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share something in this room!</p>
              <button
                onClick={() => navigate(`/room/${roomId}/add-post`)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold">
                        {(post.userId?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.userId?.username || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <p className="text-gray-800 mb-3 whitespace-pre-line">{post.content}</p>
                    
                    {post.type === 'image' && post.fileUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={post.fileUrl} 
                          alt="Post content" 
                          className="w-full h-auto max-h-96 object-contain"
                          onClick={() => window.open(post.fileUrl, '_blank')}
                        />
                      </div>
                    )}

                    {post.type === 'video' && post.fileUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                        <video 
                          controls 
                          className="w-full"
                        >
                          <source src={post.fileUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={post.likedBy?.includes(user?._id) ? solidHeart : regularHeart}
                          className={`text-lg ${post.likedBy?.includes(user?._id) ? 'text-red-500' : ''}`}
                        />
                        <span>{post.likedBy?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => setCommentModalPost(post)}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Comment Modal - Right Side Panel */}
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
            {commentModalPost.comments?.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                    {(comment.userId?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-gray-800">{comment.userId?.username || 'Unknown'}</p>
                </div>
                <p className="text-sm text-gray-700 pl-8">{comment.content}</p>
                <p className="text-xs text-gray-500 pl-8 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
                {comment.userId?._id === user?._id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id, commentModalPost._id)}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Posts;