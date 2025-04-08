import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Processing your purchase...');
    const [isProcessing, setIsProcessing] = useState(true);
    const query = new URLSearchParams(location.search);
    const productAddedRef = useRef(false);

    const productId = query.get('productId');
    const userId = query.get('userId');
    const quantity = parseInt(query.get('quantity'));

    useEffect(() => {
        const addToGallery = async () => {
            // Prevent multiple calls to the API
            if (productAddedRef.current) return;
            productAddedRef.current = true;
            
            try {
                console.log('Adding to gallery:', { userId, productId, quantity });
                const res = await axios.post(
                    'http://localhost:5000/api/v1/gallery/add',
                    { userId, productId, quantity },
                    { withCredentials: true }
                );

                console.log('Gallery response:', res.data);
                if (res.data.success) {
                    setMessage('✅ Product added to your gallery!');
                } else {
                    setMessage('⚠️ Payment successful, but failed to update gallery.');
                }
            } catch (err) {
                console.error('Error adding to gallery:', err);
                console.error('Error details:', err.response?.data);
                setMessage('❌ Something went wrong while saving your purchase.');
            } finally {
                setIsProcessing(false);
            }
        };

        if (userId && productId && quantity) {
            addToGallery();
        } else {
            setMessage('Invalid purchase data.');
            setIsProcessing(false);
        }
    }, [userId, productId, quantity]);

    const handleViewGallery = () => {
        navigate('/home/gallery');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <h1 className="text-2xl font-bold text-green-600 mb-4">Purchase Successful</h1>
                <p className="text-gray-700 mb-4">{message}</p>

                {!isProcessing && (
                    <button
                        onClick={handleViewGallery}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        View Your Gallery
                    </button>
                )}
            </div>
        </div>
    );
};

export default PurchaseSuccess;
