import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const Register = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            username: "",
            email: "",
            password: ""
        };

        if (!input.username.trim()) {
            newErrors.username = "Username is required";
            valid = false;
        } else if (input.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
            valid = false;
        }

        if (!input.email.trim()) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = "Please enter a valid email";
            valid = false;
        }

        if (!input.password) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (input.password.length < 4) {
            newErrors.password = "Password must be at least 4 characters";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                toast.success("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                if (error.response.status === 401) {
                    if (error.response.data.message.includes("email")) {
                        toast.error("Email already exists");
                        setErrors({...errors, email: "Email already registered"});
                    } else if (error.response.data.message.includes("username")) {
                        toast.error("Username already taken");
                        setErrors({...errors, username: "Username not available"});
                    } else {
                        toast.error(error.response.data.message);
                    }
                } else {
                    toast.error("Registration failed. Please try again.");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                {/* Left side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                    <div className="flex justify-center mb-8">
                        <img 
                            src="/logo.png" 
                            alt="Sphere Logo" 
                            className="h-24 w-auto"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 py-2">Create your account</h1>

                    <div className="w-full">
                        <button
                            className="w-full flex items-center justify-center gap-2 py-3 px-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => toast.info("Click button to Signup")}
                        >
                            Sign up to Sphere
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Use Anonymous Username</span>
                            </div>
                        </div>

                        <form onSubmit={signupHandler} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={input.username}
                                    onChange={changeEventHandler}
                                    className={`w-full ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'} focus:ring-2 focus:border-transparent`}
                                    placeholder="Enter your username"
                                />
                                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className={`w-full ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'} focus:ring-2 focus:border-transparent`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={input.password}
                                    onChange={changeEventHandler}
                                    className={`w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'} focus:ring-2 focus:border-transparent`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div className="pt-2">
                                {loading ? (
                                    <Button 
                                        disabled
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                                    >
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                                    >
                                        Create Account
                                    </Button>
                                )}
                            </div>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="font-medium text-green-600 hover:text-green-800 transition-colors duration-200"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right side - Illustration */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 items-center justify-center p-12">
                    <div className="w-full h-full flex items-center justify-center">
                        <img 
                            src="/background.svg" 
                            alt="Sign up illustration" 
                            className="w-full h-auto max-w-md object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register