import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddProduct = () => {
    const { roomId } = useParams();
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: 'image'
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!file) {
            setMessage('Please select a file');
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
            const res = await axios.post('http://localhost:5000/api/v1/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            setMessage('Product added successfully!');
            setProduct({
                name: '',
                description: '',
                price: '',
                type: 'image'
            });
            setFile(null);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="name">
                        Product Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="price">
                        Price
                    </label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="type">
                        Product Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={product.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="file">File</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="file">
                        Upload File
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                >
                    {loading ? 'Uploading...' : 'Add Product'}
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

export default AddProduct;