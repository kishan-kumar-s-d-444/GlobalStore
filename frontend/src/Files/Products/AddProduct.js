import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector,useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { removeAuthUser } from '../../redux/authSlice';

const AddProduct = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: 'image'
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!file) {
            toast.error('Please select a file');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('type', product.type);
        formData.append('roomId', roomId);
        formData.append('userId', user._id);

        try {
            const loadingToast = toast.loading('Adding product...');

            await axios.post('http://localhost:5000/api/v1/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            toast.dismiss(loadingToast);
            toast.success('Product added successfully!');

            setProduct({
                name: '',
                description: '',
                price: '',
                type: 'image'
            });
            setFile(null);
            setPreview(null);

            setTimeout(() => navigate(`/home/products/${roomId}`), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add product');
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
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600"
                    >
                        <span className="text-lg">{['🏠', '🔍', '💬', '👥', '🖼️', '👤', '🚪'][idx]}</span>
                        <span>{label}</span>
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-2xl mx-40">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">Add New Product</h1>
                            <p className="mt-2 opacity-90">Showcase your product in this room</p>
                        </div>

                        {/* Form content */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Product Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={product.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        placeholder="Describe your product..."
                                        required
                                    ></textarea>
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Price ($)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Product Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['image', 'video', 'file'].map((type) => (
                                            <label
                                                key={type}
                                                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${product.type === type
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-blue-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={product.type === type}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className="h-6 w-6 mb-2 flex items-center justify-center">
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
                                                        {type === 'file' && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="capitalize">{type}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product File
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors overflow-hidden">
                                                {preview ? (
                                                    product.type === 'image' ? (
                                                        <img
                                                            src={preview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-500 p-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <span className="text-xs mt-1">Upload File</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept={product.type === 'image' ? 'image/*' : product.type === 'video' ? 'video/*' : '*'}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {product.type === 'image' && (
                                                <>
                                                    <p>Recommended size: 800x800px</p>
                                                    <p>Formats: JPG, PNG, GIF</p>
                                                </>
                                            )}
                                            {product.type === 'video' && (
                                                <>
                                                    <p>Max size: 50MB</p>
                                                    <p>Formats: MP4, MOV, AVI</p>
                                                </>
                                            )}
                                            {product.type === 'file' && (
                                                <>
                                                    <p>Max size: 100MB</p>
                                                    <p>Formats: PDF, DOC, PPT</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                                Adding Product...
                                            </>
                                        ) : (
                                            'Add Product'
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

export default AddProduct;