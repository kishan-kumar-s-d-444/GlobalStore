import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
// import { FiShoppingCart,FiX } from 'react-icons/fi';
import { FiShoppingCart,FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const StoreRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/product/room/${roomId}`, {
                    withCredentials: true,
                });
                setProducts(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProducts();
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
        try {
            await axios.post(
                `http://localhost:5000/api/v1/orders`,
                {
                    productId: selectedProduct._id,
                    quantity,
                    totalPrice: (selectedProduct.price * quantity).toFixed(2)
                },
                { withCredentials: true }
            );
            alert('Purchase successful!');
            closeBuyModal();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error processing purchase. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Products</h1>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products available in this room yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {product.type === 'image' ? (
                                <img
                                    src={product.fileUrl}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                            ) : product.type === 'video' ? (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">Video File</span>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">File Attachment</span>
                                </div>
                            )}

                            <div className="p-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {product.name}
                                    </h3>
                                    <p className="text-blue-600 font-bold mt-1">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>

                                <p className="mt-3 text-gray-600 line-clamp-3">
                                    {product.description}
                                </p>

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        Sold by: {product.userId?.username || 'Unknown'}
                                    </span>
                                    <button
                                        onClick={() => openBuyModal(product)}
                                        className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <FiShoppingCart className="mr-2" />
                                        Buy Now
                                    </button>
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
                <div className="bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Purchase Product</h2>
                        <button
                            onClick={closeBuyModal}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {selectedProduct && (
                        <div>
                            <div className="flex items-center mb-4">
                                {selectedProduct.type === 'image' && (
                                    <img
                                        src={selectedProduct.fileUrl}
                                        alt={selectedProduct.name}
                                        className="w-20 h-20 object-cover rounded-lg mr-4"
                                    />
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                                    <p className="text-blue-600 font-bold">
                                        ${selectedProduct.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>${(selectedProduct.price * quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span className="text-green-600">
                                        ${(selectedProduct.price * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center"
                            >
                                <FiShoppingCart className="mr-2" />
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
                    z-index: 1000;
                }

                .modal-content {
                    position: relative;
                    border: none;
                    background: transparent;
                    overflow: auto;
                    -webkit-overflow-scrolling: touch;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default StoreRoom;