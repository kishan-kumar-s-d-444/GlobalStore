import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthUser } from '../redux/authSlice'; 

const Landing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user); 

    const handleGetStarted = () => {
        navigate('/login');
    };

    const gotoRoom = () =>{
        navigate('/home')
    }

    const handleLogout = () => {
        dispatch(removeAuthUser());
        localStorage.removeItem('token'); 
        navigate('/login'); 
    };

    const handleViewProfile = () => {
        navigate('/home/profile');
    };

    const handleViewGallery = () => {
        navigate('/home/gallery');
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white">
            {/* Navbar */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center">
                <div className="text-2xl font-bold">MyApp</div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button
                                onClick={gotoRoom}
                                className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition duration-300"
                            >
                                Rooms
                            </button>
                            <button
                                onClick={handleViewProfile}
                                className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition duration-300"
                            >
                                My Profile
                            </button>
                            <button
                                onClick={handleViewGallery}
                                className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition duration-300"
                            >
                                My Gallery
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleGetStarted}
                            className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition duration-300"
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-6">
                    Welcome to <span className="text-yellow-300">MyApp</span>
                </h1>
                <p className="text-xl mb-8">
                    {user ? `Welcome back, ${user.username}!` : 'WORK IN PROGRESS'}
                </p>
                {!user && (
                    <button
                        onClick={handleGetStarted}
                        className="bg-yellow-300 text-blue-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition duration-300"
                    >
                        Get Started
                    </button>
                )}
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 w-full p-4 text-center">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} MyApp. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default Landing;