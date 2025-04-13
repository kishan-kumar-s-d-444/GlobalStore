import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useSelector,useDispatch } from 'react-redux';
import Modal from 'react-modal';
import { removeAuthUser } from '../../redux/authSlice';
Modal.setAppElement('#root');

const Purchase = () => {
    const { roomId, productId } = useParams();
    const [searchParams] = useSearchParams();
    const quantity = parseInt(searchParams.get('quantity')) || 1;
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token');
        navigate('/login');
      };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`https://sphere-rfkm.onrender.com/api/v1/product/${productId}`, {
                    withCredentials: true,
                });
                setProduct(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching product:', err);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handlePayNow = async () => {
        try {
            console.log('Sending checkout request with data:', {
                product,
                quantity,
                userId: user._id,
                roomId
            });
            
            const res = await axios.post(
                `https://sphere-rfkm.onrender.com/api/v1/purchase/checkout`,
                {
                    product,
                    quantity,
                    userId: user._id,
                    roomId
                },
                {
                    withCredentials: true,
                }
            );

            console.log('Checkout response:', res.data);
            window.location.href = res.data.url;
        } catch (err) {
            console.error('Error starting checkout:', err);
            console.error('Error details:', err.response?.data);
            
            const errorMessage = err.response?.data?.details || err.response?.data?.error || 'Failed to initiate checkout';
            alert(`Checkout Error: ${errorMessage}`);
        }
    };

    const togglePreview = () => {
        setShowFullPreview(!showFullPreview);
    };

    const openPreviewModal = () => {
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <aside className="fixed top-0 left-0 h-screen w-80 bg-white shadow-xl overflow-y-auto z-30 border-r border-gray-200">
                    {/* Sidebar content */}
                </aside>
                <div className="ml-80 flex-1 p-8">
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalPrice = (product.price * quantity).toFixed(2);

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
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8 border-b border-gray-200">
                            <h1 className="text-3xl font-bold text-gray-800">Confirm Your Purchase</h1>
                            <p className="text-gray-600 mt-2">Review your order details before proceeding to payment</p>
                        </div>

                        <div className="p-8 flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2">
                                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                    {product.type === 'image' ? (
                                        <>
                                            <img
                                                src={product.fileUrl}
                                                alt={product.name}
                                                className={`w-full h-64 object-cover ${showFullPreview ? '' : 'filter blur-lg'}`}
                                            />
                                            {!showFullPreview && (
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4">
                                                    <FiEyeOff className="text-white text-4xl mb-3" />
                                                    <p className="text-white font-semibold text-center">
                                                        Preview blurred - purchase to view full content
                                                    </p>
                                                    <button
                                                        onClick={openPreviewModal}
                                                        className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all border border-white border-opacity-30"
                                                    >
                                                        Quick Preview
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-64 flex items-center justify-center">
                                            <span className="text-gray-500">Preview not available for this file type</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <button
                                        onClick={togglePreview}
                                        disabled={product.type !== 'image'}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                            product.type === 'image' 
                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {showFullPreview ? <FiEyeOff /> : <FiEye />}
                                        {showFullPreview ? 'Hide Preview' : 'Show Preview'}
                                    </button>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2">
                                <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
                                <p className="text-gray-600 mt-3">{product.description}</p>

                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-700">Price per item:</span>
                                        <span className="font-medium">${product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-700">Quantity:</span>
                                        <span className="font-medium">{quantity}</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-700 font-semibold">Total:</span>
                                        <span className="text-green-600 font-bold text-xl">${totalPrice}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayNow}
                                    className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg flex justify-center items-center shadow-md hover:shadow-lg transition-all"
                                >
                                    <FiShoppingCart className="mr-3" />
                                    Proceed to Secure Payment
                                </button>

                                <div className="mt-4 text-sm text-gray-500">
                                    <p>Your payment will be processed securely via Stripe.</p>
                                    <p className="mt-1">You'll gain immediate access after successful payment.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewModalOpen}
                onRequestClose={closePreviewModal}
                contentLabel="Product Preview"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-auto my-20 relative">
                    <button
                        onClick={closePreviewModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX size={24} />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Preview</h2>
                    <div className="relative">
                        {product.type === 'image' ? (
                            <>
                                <img
                                    src={product.fileUrl}
                                    alt={product.name}
                                    className="w-full max-h-[70vh] object-contain rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center pointer-events-none">
                                    <div className="text-center p-4 bg-black bg-opacity-60 rounded-lg">
                                        <FiEyeOff className="mx-auto text-white text-4xl mb-3" />
                                        <p className="text-white font-semibold">
                                            Preview blurred - purchase to view full content
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                <span className="text-gray-500">Preview not available for this file type</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 text-center">
                        <button
                            onClick={handlePayNow}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg"
                        >
                            Purchase to View Full Content
                        </button>
                    </div>
                </div>
            </Modal>

            <style jsx global>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
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
                    max-width: 56rem;
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
    );
};

export default Purchase;