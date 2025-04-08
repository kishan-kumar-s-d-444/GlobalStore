import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const Purchase = () => {
    const { roomId,productId } = useParams();
    const [searchParams] = useSearchParams();
    const quantity = parseInt(searchParams.get('quantity')) || 1;
    const { user } = useSelector((state) => state.auth);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/product/${productId}`, {
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
              'http://localhost:5000/api/v1/purchase/checkout',
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
          window.location.href = res.data.url; // redirect to Stripe
      } catch (err) {
          console.error('Error starting checkout:', err);
          console.error('Error details:', err.response?.data);
          
          // Display a more detailed error message
          const errorMessage = err.response?.data?.details || err.response?.data?.error || 'Failed to initiate checkout';
          alert(`Checkout Error: ${errorMessage}`);
      }
  };
  

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return <div className="text-center text-red-500">Product not found</div>;
    }

    const totalPrice = (product.price * quantity).toFixed(2);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Confirm Your Purchase</h1>

            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-6">
                {product.type === 'image' ? (
                    <img
                        src={product.fileUrl}
                        alt={product.name}
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                ) : (
                    <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                        <span className="text-gray-500">Preview Not Available</span>
                    </div>
                )}

                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
                    <p className="text-gray-600 mt-2">{product.description}</p>
                    <p className="text-blue-600 font-bold text-xl mt-4">
                        ${product.price.toFixed(2)} x {quantity} = ${totalPrice}
                    </p>

                    <button
                        onClick={handlePayNow}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex justify-center items-center"
                    >
                        <FiShoppingCart className="mr-2" />
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
