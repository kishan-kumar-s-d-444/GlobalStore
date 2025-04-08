import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../redux/authSlice';
import axios from 'axios';

const Landing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchAllPosts();
        }
    }, [user]);

    const fetchAllPosts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/post/all', {
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

    const handleJoinRoom = async (roomId) => {
        try {
            await axios.post(`http://localhost:5000/api/v1/room/join/${roomId}`, 
                {}, 
                { withCredentials: true }
            );
            fetchAllPosts(); // Refresh posts after joining
        } catch (err) {
            console.error(err);
        }
    };

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

    // Original navigation functions remain the same
    const handleGetStarted = () => navigate('/login');
    const gotoRoom = () => navigate('/home');
    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token');
        navigate('/login');
    };
    const handleViewProfile = () => navigate('/home/profile');
    const handleViewGallery = () => navigate('/home/gallery');

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
            {/* Navbar */}
            <nav className="w-full p-6 bg-white shadow-md flex justify-between items-center">
                <div className="text-2xl font-bold text-blue-600">MyApp</div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button onClick={gotoRoom} className="btn-primary">
                                Rooms
                            </button>
                            <button onClick={handleViewProfile} className="btn-secondary">
                                My Profile
                            </button>
                            <button onClick={handleViewGallery} className="btn-tertiary">
                                My Gallery
                            </button>
                            <button onClick={handleLogout} className="btn-danger">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={handleGetStarted} className="btn-primary">
                            Get Started
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {user ? (
                    <>
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">Recent Posts from All Rooms</h1>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-8">{error}</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No posts found. Join some rooms to see posts!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <div key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        {/* Room Header */}
                                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={post.roomId.roomImage || 'https://via.placeholder.com/50'}
                                                    alt="Room"
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">{post.roomId.roomName}</h3>
                                                    {!post.roomId.members.includes(user._id) && (
                                                        <button 
                                                            onClick={() => handleJoinRoom(post.roomId._id)}
                                                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                                                        >
                                                            Join Room
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-4">
                                            <div className="flex items-center mb-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                                    {post.userId.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span className="font-medium text-sm">{post.userId.username}</span>
                                            </div>
                                            
                                            <p className="text-gray-700 mb-4">{post.content}</p>
                                            
                                            {post.type === 'image' && post.fileUrl && (
                                                <img 
                                                    src={post.fileUrl} 
                                                    alt="Post content" 
                                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                                />
                                            )}
                                            
                                            {post.type === 'video' && post.fileUrl && (
                                                <video 
                                                    controls 
                                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                                >
                                                    <source src={post.fileUrl} type="video/mp4" />
                                                </video>
                                            )}
                                        </div>

                                        {/* Post Actions */}
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <button 
                                                    onClick={() => handleLike(post._id)}
                                                    className={`flex items-center space-x-1 ${post.likedBy.includes(user._id) ? 'text-red-500' : 'text-gray-500'}`}
                                                >
                                                    <span>❤️</span>
                                                    <span>{post.likedBy.length}</span>
                                                </button>
                                                <span className="text-gray-500 text-sm">
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        <div className="bg-gray-50 p-4">
                                            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                                {post.comments.slice(0, 3).map((comment, index) => (
                                                    <div key={index} className="flex space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                            {comment.userId.username?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium">{comment.userId.username}</p>
                                                            <p className="text-xs text-gray-700">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
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
                                                    className="flex-1 px-2 py-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                                />
                                                <button 
                                                    type="submit"
                                                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
                                                >
                                                    Post
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <h1 className="text-5xl font-bold mb-6 text-gray-800">
                            Welcome to <span className="text-blue-600">MyApp</span>
                        </h1>
                        <p className="text-xl mb-8 text-gray-600">
                            Connect with your communities and share your moments
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="w-full p-4 bg-white border-t text-center mt-8">
                <p className="text-sm text-gray-600">
                    &copy; {new Date().getFullYear()} MyApp. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

// Reusable button styles
const btnStyle = "px-6 py-2 rounded-full font-semibold transition duration-300";
const btnPrimary = `${btnStyle} bg-blue-500 text-white hover:bg-blue-600`;
const btnSecondary = `${btnStyle} bg-purple-500 text-white hover:bg-purple-600`;
const btnTertiary = `${btnStyle} bg-green-500 text-white hover:bg-green-600`;
const btnDanger = `${btnStyle} bg-red-500 text-white hover:bg-red-600`;

export default Landing;