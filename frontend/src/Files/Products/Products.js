import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { FiEdit, FiTrash2, FiX, FiSave, FiPlus, FiHome, FiSearch, FiMessageSquare, FiUsers, FiImage, FiUser, FiLogOut,FiVideo,FiFile } from 'react-icons/fi';
import Modal from 'react-modal';
import { removeAuthUser } from '../../redux/authSlice'

Modal.setAppElement('#root');

const Products = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
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
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Room Products</h1>
                            <p className="text-gray-500 mt-1">Manage all products in this room</p>
                        </div>
                        <button
                            onClick={() => navigate(`/home/addproduct/${roomId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all flex items-center shadow-md hover:shadow-lg"
                        >
                            <FiPlus className="mr-2" />
                            Add New Product
                        </button>
                    </div>

                    {products.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="h-24 w-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <FiPlus className="text-blue-500 text-3xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">This room doesn't have any products yet. Add your first product to get started.</p>
                                <button
                                    onClick={() => navigate(`/home/addproduct/${roomId}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all flex items-center mx-auto shadow-md hover:shadow-lg"
                                >
                                    <FiPlus className="mr-2" />
                                    Add Product
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                
                                <div
                                    key={product._id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-gray-100"
                                >
                                    <div className="relative">
                                        {product.type === 'image' ? (
                                            <img
                                                src={product.fileUrl}
                                                alt={product.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : product.type === 'video' ? (
                                            <div className="w-full h-48 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <FiVideo className="text-blue-500" />
                                                    </div>
                                                    <span className="text-gray-500 font-medium">Video File</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <FiFile className="text-purple-500" />
                                                    </div>
                                                    <span className="text-gray-500 font-medium">File Attachment</span>
                                                </div>
                                            </div>
                                        )}
                                        {user._id === product.userId && (
                                            <div className="absolute top-3 right-3 flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-sm transition-all"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-sm transition-all"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-blue-600 font-bold ml-2 whitespace-nowrap">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {product.description}
                                        </p>
                                        
                                        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-3">
                                            <span className="truncate max-w-[120px]">
                                                {user.username || 'Unknown'}
                                            </span>
                                            <span>
                                                {new Date(product.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Product"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto my-20 border border-gray-100">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                        <button
                            onClick={closeEditModal}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={editedProduct.name}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={editedProduct.description}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={editedProduct.price}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center shadow-md hover:shadow-lg"
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
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Products;