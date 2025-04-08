import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Gallery = () => {
    const { user } = useSelector(state => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) fetchGallery();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Purchased Products</h1>

            {products.length === 0 ? (
                <p className="text-gray-500">You haven't purchased anything yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {product.type === 'image' ? (
                                <img src={product.fileUrl} alt={product.name} className="w-full h-48 object-cover" />
                            ) : product.type === 'video' ? (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Video File</div>
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">File</div>
                            )}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1">Qty: {product.quantity}</p>
                                <p className="text-xs text-gray-400 mt-1">Purchased on {new Date(product.purchasedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
