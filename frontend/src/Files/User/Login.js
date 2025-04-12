import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../../redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            email: "",
            password: ""
        };

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
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/user/login`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
                dispatch(setAuthUser(res.data.user));
                toast.success("Login successful! Redirecting...");
                setTimeout(() => {
                    navigate("/");
                }, 1000);
                setInput({
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Invalid credentials");
                    setErrors({
                        email: "Invalid email or password",
                        password: "Invalid email or password"
                    });
                } else {
                    toast.error(error.response.data.message || "Login failed");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <img 
                            src="/logo.png" 
                            alt="Sphere Logo" 
                            className="h-24 w-24 object-contain"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Welcome back to Sphere
                    </h1>

                    <div className="flex flex-col items-center mb-6">
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 font-medium"
                            onClick={() => toast.info("Click button to Login")}
                        >
                           Login To Sphere
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                login with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={signupHandler} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'} focus:outline-none focus:ring-2`}
                                placeholder="your@email.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={changeEventHandler}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'} focus:outline-none focus:ring-2`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        <div className="pt-2">
                            {loading ? (
                                <Button 
                                    disabled
                                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 flex justify-center items-center"
                                >
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Login
                                </Button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="font-medium text-green-600 hover:text-green-800 transition-colors duration-200"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login