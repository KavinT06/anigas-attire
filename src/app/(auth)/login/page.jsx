"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import logo from "../../../assets/logo.jpg";

export default function LoginPage() {
    // Configure your Django backend URL here
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
        otp: '',
        recaptcha_token: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Basic phone number validation
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    };    // Test connection to Django backend
    const testConnection = async () => {
        const baseUrl = API_BASE_URL;
        
        console.log(`Testing backend at: ${baseUrl}`);
        
        try {
            // Test available endpoints from Django URL patterns
            const endpoints = [
                '/api/',
                '/api/auth/',
                '/api/auth/login/',
                '/ecom/',
                '/ecom/auth/login/',
                '/auth/login/'
            ];
            
            let workingEndpoint = null;
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Testing: ${baseUrl}${endpoint}`);
                    const response = await axios.get(`${baseUrl}${endpoint}`, { timeout: 3000 });
                    console.log(`✅ ${endpoint} - Status: ${response.status}`);
                    workingEndpoint = endpoint;
                    break;
                } catch (endpointError) {
                    if (endpointError.response) {
                        console.log(`✅ ${endpoint} - Status: ${endpointError.response.status} (exists but may need POST)`);
                        workingEndpoint = endpoint;
                        break;
                    }
                    console.log(`❌ ${endpoint} - ${endpointError.message}`);
                }
            }
            
            if (workingEndpoint) {
                alert(`✅ Backend is running!\n\nWorking endpoint found: ${baseUrl}${workingEndpoint}\n\nCheck console for all endpoint tests.`);
            } else {
                alert(`⚠️ Backend is running but no auth endpoints found.\n\nAvailable patterns from Django:\n- admin/\n- api/\n- api-auth/\n- ecom/\n\nCheck your Django URLs configuration.`);
            }
            
        } catch (err) {
            console.error('Connection test failed:', err);
            alert(`❌ Connection error: ${err.message}\n\nURL: ${baseUrl}`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (!formData.phone_number.trim()) {
            setError('Please enter your phone number');
            setIsLoading(false);
            return;
        }

        // if (!validatePhoneNumber(formData.phone_number)) {
        //     setError('Please enter a valid phone number');
        //     setIsLoading(false);
        //     return;
        // }

        if (!formData.password.trim()) {
            setError('Please enter your password');
            setIsLoading(false);
            return;
        }

        // if (formData.password.length < 6) {
        //     setError('Password must be at least 6 characters long');
        //     setIsLoading(false);
        //     return;
        // }

        // if (!formData.otp.trim()) {
        //     setError('Please enter your OTP');
        //     setIsLoading(false);
        //     return;
        // }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/authentication/token/`, {
                phone_number: formData.phone_number.trim(),
                password: formData.password,
                // otp: formData.otp.trim(),
                // recaptcha_token: formData.recaptcha_token || 'dummy_token' // You might need to implement reCAPTCHA
            }, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Store JWT token in localStorage
            if (response.status === 200) {
                localStorage.setItem('authToken', response.data.token);

                // Redirect to orders page
                router.push('/account/orders');
            } else {
                setError('Login failed. No token received.');
            }
        } catch (err) {
            // Handle different types of errors with detailed debugging
            console.error('Login error:', err);

            if (err.response) {
                // Server responded with error status
                console.log('Server error response:', err.response.data);
                console.log('Status code:', err.response.status);

                const errorMessage = err.response.data?.message ||
                    err.response.data?.detail ||
                    err.response.data?.error ||
                    `Server error (${err.response.status}): Invalid credentials`;
                setError(errorMessage);
            } else if (err.request) {
                // Network error - connection failed
                console.log('Network error:', err.request);
                setError(`Connection failed: Make sure Django server is running on http://localhost:8000`);
            } else if (err.code === 'ECONNREFUSED') {
                setError('Django server not running. Start with: python manage.py runserver');
            } else {
                // Other error
                console.log('Other error:', err.message);
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <Image
                            className="w-16 h-16 rounded-lg"
                            src={logo}
                            alt="Aniga's Attire Logo"
                        />
                        <h1 className="ml-3 text-2xl font-bold text-gray-900">
                            Aniga's Attire
                        </h1>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="space-y-6">
                            {/* Phone Input */}
                            <div>
                                <label
                                    htmlFor="phone_number"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Phone Number
                                </label>
                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    required
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="Enter your phone number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* OTP Input */}
                            {/* <div>
                                <label
                                    htmlFor="otp"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    OTP (One-Time Password)
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="Enter your OTP"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                />
                            </div> */}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
