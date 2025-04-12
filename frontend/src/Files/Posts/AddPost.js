import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { removeAuthUser } from '../../redux/authSlice';

const AddPost = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    
    const [post, setPost] = useState({
        content: '',
        type: 'text'
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPost({
            ...post,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (post.type === 'image') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (post.type !== 'text' && !file) {
            toast.error(`Please select a ${post.type} file`);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('content', post.content);
        formData.append('type', post.type);
        formData.append('roomId', roomId);
        formData.append('userId', user._id);

        try {
            const loadingToast = toast.loading('Creating post...');

            await axios.post('http://localhost:5000/api/v1/post/addPost', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            toast.dismiss(loadingToast);
            toast.success('Post created successfully!');

            setPost({
                content: '',
                type: 'text'
            });
            setFile(null);
            setPreview(null);

            setTimeout(() => navigate(`/home/posts/${roomId}`), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Sidebar - Same as AddProduct */}
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
                        className={`w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600"
                            ${
                                label === 'My Rooms'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                    >
                        <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
                        <span>{label}</span>
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">Create New Post</h1>
                            <p className="mt-2 opacity-90">Share your thoughts with the community</p>
                        </div>

                        {/* Form content */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Post Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Post Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['text', 'image', 'video'].map((type) => (
                                            <label
                                                key={type}
                                                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${post.type === type
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-blue-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={post.type === type}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className="h-6 w-6 mb-2 flex items-center justify-center">
                                                        {type === 'text' && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        )}
                                                        {type === 'image' && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                        {type === 'video' && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 01221 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="capitalize">{type}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {post.type === 'text' ? 'Post Content' : post.type === 'image' ? 'Image Caption' : 'Video Caption'}
                                    </label>
                                    <textarea
                                        name="content"
                                        value={post.content}
                                        onChange={handleChange}
                                        rows={post.type === 'text' ? "4" : "2"}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        placeholder={post.type === 'text' ? "What's on your mind?" : "Add a caption..."}
                                        required
                                    ></textarea>
                                </div>

                                {/* File Upload */}
                                {(post.type === 'image' || post.type === 'video') && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {post.type === 'image' ? 'Image' : 'Video'} Upload
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors overflow-hidden">
                                                    {preview ? (
                                                        post.type === 'image' ? (
                                                            <img
                                                                src={preview}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-gray-500 p-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <span className="text-xs mt-1">Upload {post.type === 'image' ? 'Image' : 'Video'}</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept={post.type === 'image' ? 'image/*' : 'video/*'}
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        required={post.type !== 'text'}
                                                    />
                                                </label>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {post.type === 'image' ? (
                                                    <>
                                                        <p>Recommended size: 800x800px</p>
                                                        <p>Formats: JPG, PNG, GIF</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>Max size: 50MB</p>
                                                        <p>Formats: MP4, MOV, AVI</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all transform ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.01]'
                                            } flex items-center justify-center`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Post...
                                            </>
                                        ) : (
                                            'Create Post'
                                        )}
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

export default AddPost;