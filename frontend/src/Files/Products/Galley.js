import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../../redux/authSlice';
import { FiHome, FiSearch, FiMessageSquare, FiUsers, FiImage, FiUser, FiLogOut, FiDownload, FiShare2, FiHeart, FiEye, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
                const res = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/gallery/${user._id}`, {
                    withCredentials: true,
                });

                const gallery = res.data.gallery;
                const formatted = gallery.products.map(item => {
                    if (!item.productId) {
                        return {
                            _id: item._id,
                            isDeleted: true,
                            purchasedAt: item.purchasedAt,
                            quantity: item.quantity || 1,
                            name: 'Deleted Product',
                            description: 'The owner has removed this product from their store.',
                            price: 0,
                            type: 'other',
                            fileUrl: ''
                        };
                    }
                    
                    return {
                        ...item.productId,
                        name: item.productId?.name || 'Untitled',
                        description: item.productId?.description || '',
                        price: item.productId?.price || 0,
                        type: item.productId?.type || 'other',
                        fileUrl: item.productId?.fileUrl || '',
                        purchasedAt: item.purchasedAt,
                        quantity: item.quantity || 1,
                        isDeleted: false
                    };
                });

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
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleRemoveFromCollection = async (productId) => {
        try {
            const loadingToast = toast.loading('Removing from collection...');
            
            const response = await axios.delete(`https://sphere-rfkm.onrender.com/api/v1/gallery/remove/${productId}`, {
                withCredentials: true
            });
            
            if (response.status === 200) {
                setProducts(products.filter(product => product._id !== productId));
                setSelectedProduct(null);
                
                toast.dismiss(loadingToast);
                toast.success('Removed from your collection');
            } else {
                throw new Error('Failed to remove product');
            }
        } catch (err) {
            console.error('Error removing product:', err);
            toast.error(err.response?.data?.message || 'Failed to remove from collection');
        }
    };

    const filteredProducts = products
        .filter(product => {
            const productName = product?.name || '';
            const productType = product?.type || 'other';
            const searchTermLower = searchTerm.toLowerCase();
            
            return (
                productName.toLowerCase().includes(searchTermLower) &&
                (selectedCategory === 'all' || productType === selectedCategory)
            );
        })
        .sort((a, b) => {
            const dateA = a?.purchasedAt ? new Date(a.purchasedAt) : 0;
            const dateB = b?.purchasedAt ? new Date(b.purchasedAt) : 0;
            const priceA = a?.price || 0;
            const priceB = b?.price || 0;
            const nameA = a?.name || '';
            const nameB = b?.name || '';

            if (sortOption === 'recent') {
                return dateB - dateA;
            } else if (sortOption === 'price-high') {
                return priceB - priceA;
            } else if (sortOption === 'price-low') {
                return priceA - priceB;
            } else if (sortOption === 'name') {
                return nameA.localeCompare(nameB);
            }
            return 0;
        });

    const categories = [
        { id: 'all', name: 'All Items' },
        { id: 'image', name: 'Images' },
        { id: 'video', name: 'Videos' },
        { id: 'file', name: 'Files' },
        { id: 'other', name: 'Other Files' }
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                {/* Sidebar - Always visible */}
                <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-md overflow-y-auto z-30">
                    {/* Sidebar content remains the same */}
                </aside>

                <div className="flex-1 p-6 ml-0 md:ml-64 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-blue-600 font-medium">Loading your gallery...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Sidebar - Always visible */}
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
                            className={`w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                                label === 'My Gallery'
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
                                onClick={() => navigate('/home/publicrooms')}
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
                                    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                        product.isDeleted ? 'border-l-4 border-red-500' : ''
                                    }`}
                                >
                                    <div 
                                        className="relative cursor-pointer" 
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        {product.isDeleted ? (
                                            <div className="w-full h-48 bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <FiAlertTriangle className="mx-auto text-4xl text-red-500 mb-2" />
                                                    <p className="text-red-600 font-medium">Product Deleted</p>
                                                    <p className="text-xs text-red-400 mt-1">No longer available</p>
                                                </div>
                                            </div>
                                        ) : product.type === 'image' ? (
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
                                        
                                        {!product.isDeleted && (
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
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFromCollection(product._id);
                                                    }}
                                                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className={`text-lg font-semibold truncate ${
                                            product.isDeleted ? 'text-red-600' : 'text-gray-800'
                                        }`}>
                                            {product.name}
                                        </h3>
                                        <div className="flex justify-between items-center mt-2">
                                            {!product.isDeleted && (
                                                <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Qty: {product.quantity}</span>
                                                {!product.isDeleted && (
                                                    <FiHeart className="text-gray-400 hover:text-red-500 cursor-pointer" />
                                                )}
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
                                <h2 className={`text-2xl font-bold ${
                                    selectedProduct.isDeleted ? 'text-red-600' : 'text-gray-800'
                                }`}>
                                    {selectedProduct.name}
                                </h2>
                                <button 
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    {selectedProduct.isDeleted ? (
                                        <div className="w-full h-64 bg-gradient-to-br from-red-50 to-pink-100 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                                            <FiAlertTriangle className="text-5xl text-red-500 mb-4" />
                                            <h3 className="text-xl font-medium text-red-600 mb-2">Product Unavailable</h3>
                                            <p className="text-red-500">
                                                The seller has removed this product from their store.
                                            </p>
                                        </div>
                                    ) : selectedProduct.type === 'image' ? (
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
                                            {!selectedProduct.isDeleted && (
                                                <>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Price</p>
                                                        <p className="font-medium">${selectedProduct.price.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Type</p>
                                                        <p className="font-medium capitalize">{selectedProduct.type}</p>
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-500">Quantity</p>
                                                <p className="font-medium">{selectedProduct.quantity}</p>
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
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {selectedProduct.isDeleted ? 'Status' : 'Description'}
                                        </h3>
                                        <p className={`${
                                            selectedProduct.isDeleted ? 'text-red-500' : 'text-gray-600'
                                        }`}>
                                            {selectedProduct.isDeleted 
                                                ? 'This product is no longer available.'
                                                : selectedProduct.description || 'No description available for this item.'
                                            }
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        {!selectedProduct.isDeleted && (
                                            <>
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
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleRemoveFromCollection(selectedProduct._id);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${
                                                selectedProduct.isDeleted 
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } rounded-lg transition-colors`}
                                        >
                                            <FiTrash2 /> Remove from Collection
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