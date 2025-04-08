import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Posts = () => {
  const { roomId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/post/room/${roomId}`, {
          withCredentials: true
        });
        setPosts(res.data);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [roomId]);

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/post/${postId}/like`, 
        { userId: user._id },
        { withCredentials: true }
      );
      setPosts(posts.map(post => 
        post._id === postId ? {
          ...post,
          likedBy: post.likedBy.includes(user._id) 
            ? post.likedBy.filter(id => id !== user._id)
            : [...post.likedBy, user._id]
        } : post
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/v1/post/${postId}/comment`,
        { userId: user._id, content },
        { withCredentials: true }
      );
      setPosts(posts.map(post => 
        post._id === postId ? {
          ...post,
          comments: [...post.comments, res.data]
        } : post
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-8">Loading posts...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Room Posts</h2>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Be the first to post something!
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {post.userId.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.userId.username || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-800 mb-4">{post.content}</p>
                
                {post.type === 'image' && post.fileUrl && (
                  <div className="mb-4">
                    <img 
                      src={post.fileUrl} 
                      alt="Post content" 
                      className="w-full h-auto rounded-lg object-cover max-h-96"
                    />
                  </div>
                )}

                {post.type === 'video' && post.fileUrl && (
                  <div className="mb-4">
                    <video 
                      controls 
                      className="w-full rounded-lg max-h-96"
                    >
                      <source src={post.fileUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1 ${post.likedBy.includes(user._id) ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <span>❤️</span>
                    <span>{post.likedBy.length}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <span>💬</span>
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-50 p-4">
                <div className="space-y-3 mb-4">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        {comment.userId.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 bg-white p-2 rounded-lg">
                        <p className="font-medium text-sm">{comment.userId.username}</p>
                        <p className="text-gray-800 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const content = e.target.comment.value.trim();
                    if (content) {
                      handleComment(post._id, content);
                      e.target.comment.value = '';
                    }
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;