import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector,useDispatch } from 'react-redux';
import { FiShoppingCart, FiEdit, FiTrash2, FiX, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import Modal from 'react-modal';
import { removeAuthUser } from '../../redux/authSlice';
Modal.setAppElement('#root');

const StoreRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [purchasedProducts, setPurchasedProducts] = useState([]);

    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token');
        navigate('/login');
      };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/product/room/${roomId}`, {
                    withCredentials: true,
                });

                const productsWithUsernames = await Promise.all(
                    res.data.map(async (product) => {
                        try {
                            const userRes = await axios.get(
                                `http://localhost:5000/api/v1/user/${product.userId}`,
                                { withCredentials: true }
                            );
                            return {
                                ...product,
                                username: userRes.data.data.username || 'Unknown'
                            };
                            
                        } catch (err) {
                            console.error(`Error fetching user ${product.userId}:`, err);
                            return {
                                ...product,
                                username: 'Unknown'
                            };
                        }
                    })
                );

                setProducts(productsWithUsernames);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProducts();

        // Load purchased products from local storage or API
        const purchased = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
        setPurchasedProducts(purchased);
    }, [roomId]);

    const openBuyModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setIsBuyModalOpen(true);
    };

    const closeBuyModal = () => {
        setIsBuyModalOpen(false);
        setSelectedProduct(null);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        setQuantity(value > 0 ? value : 1);
    };

    const handlePurchase = async () => {
        // In a real app, you would verify the purchase with your backend
        const newPurchased = [...purchasedProducts, selectedProduct._id];
        setPurchasedProducts(newPurchased);
        localStorage.setItem('purchasedProducts', JSON.stringify(newPurchased));
        navigate(`/home/store/${roomId}/purchase/${selectedProduct._id}?quantity=${quantity}`);
    };

    const isPurchased = (productId) => {
        return purchasedProducts.includes(productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-xl overflow-y-auto z-30 border-r border-gray-200">
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
                            className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 ${
                                label === 'Rooms' 
                                    ? 'bg-blue-100 text-blue-600 font-medium' 
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
            <div className="ml-80 flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Available Products</h1>

                    {products.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm p-8">
                            <p className="text-gray-500 text-xl">No products available in this room yet.</p>
                            <button 
                                onClick={() => navigate(-1)}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="relative">
                                        {product.type === 'image' ? (
                                            <div className="w-full h-64 overflow-hidden">
                                                <img
                                                    src={product.fileUrl}
                                                    alt={product.name}
                                                    className={`w-full h-full object-cover ${isPurchased(product._id) ? '' : 'filter blur-md'}`}
                                                />
                                            </div>
                                        ) : product.type === 'video' ? (
                                            <div className={`w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${isPurchased(product._id) ? '' : 'filter blur-md'}`}>
                                                <span className="text-gray-500 text-lg">Video File</span>
                                            </div>
                                        ) : (
                                            <div className={`w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${isPurchased(product._id) ? '' : 'filter blur-md'}`}>
                                                <span className="text-gray-500 text-lg">File Attachment</span>
                                            </div>
                                        )}
                                        {!isPurchased(product._id) && (
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <FiEyeOff className="mx-auto text-white text-4xl mb-3" />
                                                    <p className="text-white font-semibold">Purchase to view</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                                    {product.name}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    Sold by: {product.username || 'Unknown'}
                                                </span>
                                            </div>
                                            <p className="text-blue-600 font-bold text-xl">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <p className={`mt-4 text-gray-600 ${isPurchased(product._id) ? '' : 'line-clamp-2'}`}>
                                            {isPurchased(product._id) ? product.description : 'Purchase to view full description'}
                                        </p>

                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            {isPurchased(product._id) ? (
                                                <button
                                                    onClick={() => window.open(product.fileUrl, '_blank')}
                                                    className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                                                >
                                                    <FiEye className="mr-2" />
                                                    View Content
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openBuyModal(product)}
                                                    className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                                                >
                                                    <FiShoppingCart className="mr-2" />
                                                    Buy Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Buy Product Modal */}
                    <Modal
                        isOpen={isBuyModalOpen}
                        onRequestClose={closeBuyModal}
                        contentLabel="Buy Product"
                        className="modal-content"
                        overlayClassName="modal-overlay"
                    >
                        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto my-20 relative">
                            <button
                                onClick={closeBuyModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX size={24} />
                            </button>

                            {selectedProduct && (
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="relative">
                                            {selectedProduct.type === 'image' && (
                                                <div className="w-24 h-24 overflow-hidden rounded-lg border border-gray-200">
                                                    <img
                                                        src={selectedProduct.fileUrl}
                                                        alt={selectedProduct.name}
                                                        className="w-full h-full object-cover filter blur-md"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                        <FiEyeOff className="text-white text-2xl" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-6">
                                            <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.name}</h3>
                                            <p className="text-blue-600 font-bold text-lg mt-1">
                                                ${selectedProduct.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-medium mb-3">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between mb-3">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">${(selectedProduct.price * quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                                            <span>Total:</span>
                                            <span className="text-green-600">
                                                ${(selectedProduct.price * quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-blue-700 text-sm">
                                            <span className="font-semibold">Note:</span> After purchase, you'll gain full access to view and download this content.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handlePurchase}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 flex justify-center items-center shadow-md hover:shadow-lg"
                                    >
                                        <FiShoppingCart className="mr-3" />
                                        Confirm Purchase
                                    </button>
                                </div>
                            )}
                        </div>
                    </Modal>

                    <style jsx global>{`
                        .modal-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: rgba(0, 0, 0, 0.5);
                            backdrop-filter: blur(4px);
                            z-index: 1000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }

                        .modal-content {
                            position: relative;
                            border: none;
                            background: transparent;
                            overflow: auto;
                            -webkit-overflow-scrolling: touch;
                            outline: none;
                            width: 100%;
                            max-width: 32rem;
                            animation: modalFadeIn 0.3s ease-out;
                        }

                        @keyframes modalFadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default StoreRoom;