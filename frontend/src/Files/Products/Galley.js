import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../../redux/authSlice';
import { FiHome, FiSearch, FiMessageSquare, FiUsers, FiImage, FiUser, FiLogOut, FiDownload, FiShare2, FiHeart, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Gallery = () => {
    const { user } = useSelector(state => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('recent');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/gallery/${user._id}`, {
                    withCredentials: true,
                });

                const gallery = res.data.gallery;
                const formatted = gallery.products.map(item => ({
                    ...item.productId,
                    purchasedAt: item.purchasedAt,
                    quantity: item.quantity
                }));

                setProducts(formatted);
            } catch (err) {
                console.error('Error fetching gallery:', err);
                setError('Failed to load your gallery. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) fetchGallery();
    }, [user]);

    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDownload = (fileUrl, name) => {
        // In a real app, you would implement proper download functionality
        window.open(fileUrl, '_blank');
    };

    const handleShare = async (product) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: `Check out this ${product.type} I purchased!`,
                    url: window.location.href,
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const filteredProducts = products
        .filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'all' || product.type === selectedCategory)
        )
        .sort((a, b) => {
            if (sortOption === 'recent') {
                return new Date(b.purchasedAt) - new Date(a.purchasedAt);
            } else if (sortOption === 'price-high') {
                return b.price - a.price;
            } else if (sortOption === 'price-low') {
                return a.price - b.price;
            } else if (sortOption === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

    const categories = [
        { id: 'all', name: 'All Items' },
        { id: 'image', name: 'Images' },
        { id: 'video', name: 'Videos' },
        { id: 'other', name: 'Other Files' }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-blue-600 font-medium">Loading your gallery...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white shadow-xl z-30">
                <div className="p-6 flex flex-col h-full">
                    <div className="mb-8 text-center">
                        <img src="/logo.png" alt="Logo" className="h-20 mx-auto rounded-lg" />
                        <h1 className="mt-2 text-xl font-bold text-gray-800">Digital Gallery</h1>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                        {[
                            { label: 'Home', icon: <FiHome />, action: () => navigate('/') },
                            { label: 'Search', icon: <FiSearch />, action: () => navigate('/home/search') },
                            { label: 'Rooms', icon: <FiMessageSquare />, action: () => navigate('/home') },
                            { label: 'My Rooms', icon: <FiUsers />, action: () => navigate('/home') },
                            { label: 'My Gallery', icon: <FiImage />, action: () => navigate('/home/gallery') },
                            { label: 'My Profile', icon: <FiUser />, action: () => navigate('/home/profile') },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-blue-600"
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="mt-auto px-4 py-3 text-left text-gray-700 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:text-red-600"
                    >
                        <FiLogOut className="text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 ml-0 md:ml-64">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">My Gallery</h1>
                            <p className="text-gray-600">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} in your collection
                            </p>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your gallery..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {filteredProducts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-sm text-center"
                        >
                            <FiImage className="text-5xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">Your gallery is empty</h3>
                            <p className="text-gray-500 mb-6">You haven't purchased anything yet.</p>
                            <button
                                onClick={() => navigate('/home')}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Browse Products
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div 
                                        className="relative cursor-pointer" 
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        {product.type === 'image' ? (
                                            <img 
                                                src={product.fileUrl} 
                                                alt={product.name} 
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : product.type === 'video' ? (
                                            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <FiEye className="mx-auto text-4xl text-purple-500 mb-2" />
                                                    <p className="text-purple-600 font-medium">Video Preview</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <FiDownload className="mx-auto text-4xl text-blue-500 mb-2" />
                                                    <p className="text-blue-600 font-medium">Download File</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(product.fileUrl, product.name);
                                                }}
                                                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-500"
                                                title="Download"
                                            >
                                                <FiDownload size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(product);
                                                }}
                                                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-500"
                                                title="Share"
                                            >
                                                <FiShare2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Qty: {product.quantity}</span>
                                                <FiHeart className="text-gray-400 hover:text-red-500 cursor-pointer" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Purchased on {new Date(product.purchasedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2>
                                <button 
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    {selectedProduct.type === 'image' ? (
                                        <img 
                                            src={selectedProduct.fileUrl} 
                                            alt={selectedProduct.name} 
                                            className="w-full rounded-lg object-cover max-h-96"
                                        />
                                    ) : selectedProduct.type === 'video' ? (
                                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <FiEye className="mx-auto text-4xl text-purple-500 mb-2" />
                                                <p className="text-purple-600 font-medium">Video Content</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <FiDownload className="mx-auto text-4xl text-blue-500 mb-2" />
                                                <p className="text-blue-600 font-medium">File Content</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Price</p>
                                                <p className="font-medium">${selectedProduct.price.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Quantity</p>
                                                <p className="font-medium">{selectedProduct.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Type</p>
                                                <p className="font-medium capitalize">{selectedProduct.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Purchased On</p>
                                                <p className="font-medium">
                                                    {new Date(selectedProduct.purchasedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                        <p className="text-gray-600">
                                            {selectedProduct.description || 'No description available for this item.'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDownload(selectedProduct.fileUrl, selectedProduct.name)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <FiDownload /> Download
                                        </button>
                                        <button
                                            onClick={() => handleShare(selectedProduct)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <FiShare2 /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Gallery;