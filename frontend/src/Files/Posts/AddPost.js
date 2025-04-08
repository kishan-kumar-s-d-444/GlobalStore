import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddPost = () => {
    const { roomId } = useParams();
    
    const [post, setPost] = useState({
        content: '',
        type: 'text'
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    
    const handleChange = (e) => {
        setPost({
            ...post,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (post.type !== 'text' && !file) {
            setMessage('Please select a file for image/video post');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('content', post.content);
        formData.append('type', post.type);
        formData.append('roomId', roomId);
        formData.append('userId', user._id);

        // Debug: Log form data contents
        console.log('Form data contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            // Use a different approach to send the form data
            const res = await axios({
                method: 'post',
                url: 'http://localhost:5000/api/v1/post/addPost',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            
            console.log('Response:', res.data);
            setMessage('Post created successfully!');
            setPost({
                content: '',
                type: 'text'
            });
            setFile(null);
        } catch (err) {
            console.error('Error creating post:', err);
            setMessage('Failed to create post: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Post</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="type">
                        Post Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={post.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="text">Text (Like Tweet)</option>
                        <option value="image">Image (Like Instagram)</option>
                        <option value="video">Video</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="content">
                        {post.type === 'text' ? 'Post Content' : post.type === 'image' ? 'Image Caption' : 'Video Caption'}
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={post.type === 'text' ? "4" : "2"}
                        placeholder={post.type === 'text' ? "What's on your mind?" : "Add a caption..."}
                        required
                    />
                </div>

                {(post.type === 'image' || post.type === 'video') && (
                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="file">
                            Upload {post.type === 'image' ? 'Image' : 'Video'}
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            accept={post.type === 'image' ? 'image/*' : 'video/*'}
                            required={post.type !== 'text'}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {post.type === 'image' ? 
                                'Supported formats: JPEG, PNG' : 
                                'Supported formats: MP4, MOV'}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                >
                    {loading ? 'Posting...' : 'Create Post'}
                </button>

                {message && (
                    <p className={`text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default AddPost;