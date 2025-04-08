import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Products = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [editedProduct, setEditedProduct] = useState({
        name: '',
        description: '',
        price: '',
    });

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

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/v1/product/${productId}`, {
                    withCredentials: true,
                });
                setProducts(products.filter(product => product._id !== productId));
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Error deleting product. Please try again.');
            }
        }
    };

    const openEditModal = (product) => {
        setCurrentProduct(product);
        setEditedProduct({
            name: product.name,
            description: product.description,
            price: product.price,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentProduct(null);
    };

    const handleEditChange = (e) => {
        setEditedProduct({
            ...editedProduct,
            [e.target.name]: e.target.value,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(
                `http://localhost:5000/api/v1/product/${currentProduct._id}`,
                editedProduct,
                { withCredentials: true }
            );
            setProducts(products.map(product => 
                product._id === currentProduct._id ? res.data : product
            ));
            closeEditModal();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error updating product. Please try again.');
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Room Products</h1>
                <button
                    onClick={() => navigate(`/home/addproduct/${roomId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Add New Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found in this room.</p>
                    <button
                        onClick={() => navigate(`/home/addproduct/${roomId}`)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Add Your First Product
                    </button>
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
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {product.name}
                                        </h3>
                                        <p className="text-blue-600 font-bold mt-1">
                                            ${product.price.toFixed(2)}
                                        </p>
                                    </div>
                                    {user._id === product.userId && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 text-gray-600 line-clamp-3">
                                    {product.description}
                                </p>

                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                        Added by: {product.userId?.username || 'Unknown'}
                                    </span>
                                    <span>
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Product"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                        <button
                            onClick={closeEditModal}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={editedProduct.name}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={editedProduct.description}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={editedProduct.price}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <FiSave className="mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </form>
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

export default Products;