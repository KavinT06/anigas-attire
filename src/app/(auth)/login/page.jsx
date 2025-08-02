"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import logo from "../../../assets/logo.jpg";

export default function LoginPage() {
    // Configure your Django backend URL here
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5025';

    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
        otp: '',
        recaptcha_token: ''
    });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: phone input, 2: OTP input
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

    const handleOtpChange = (index, value) => {
        // Only allow digits and limit to 1 character
        if (!/^\d*$/.test(value) || value.length > 1) return;
        
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);
        
        // Update the combined OTP in formData
        setFormData(prev => ({
            ...prev,
            otp: newOtpDigits.join('')
        }));
        
        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
        
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleOtpKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleBackToPhone = () => {
        setStep(1);
        setFormData(prev => ({ ...prev, otp: '' }));
        setOtpDigits(['', '', '', '']);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (step === 1) {
            // First step: Send OTP to phone number
            if (!formData.phone_number.trim()) {
                setError('Please enter your phone number');
                setIsLoading(false);
                return;
            }

            if (!validatePhoneNumber(formData.phone_number)) {
                setError('Please enter a valid phone number');
                setIsLoading(false);
                return;
            }

            // Development Mode: Skip API call and go directly to OTP step
            // Remove this block when backend is ready
            console.log('🚧 Development Mode: Simulating OTP send...');
            setTimeout(() => {
                console.log(`📱 Simulated OTP sent to: ${formData.phone_number}`);
                setStep(2); // Move to OTP input step
                setError(''); // Clear any previous errors
                setIsLoading(false);
            }, 1000); // Simulate 1 second delay
            return;

            // Production Code: (Uncomment when backend is ready)
            /*
            try {
                // Try different possible endpoints for sending OTP
                const possibleEndpoints = [
                    '/api/auth/send-otp/',
                    '/api/authentication/send-otp/',
                    '/ecom/auth/send-otp/',
                    '/auth/send-otp/',
                    '/api/send-otp/',
                    '/ecom/send-otp/'
                ];

                let success = false;
                let lastError = null;

                for (const endpoint of possibleEndpoints) {
                    try {
                        console.log(`Trying OTP endpoint: ${API_BASE_URL}${endpoint}`);
                        
                        const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
                            phone_number: formData.phone_number.trim(),
                        }, {
                            timeout: 10000,
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });

                        if (response.status === 200 || response.status === 201) {
                            console.log(`✅ OTP sent successfully via: ${endpoint}`);
                            setStep(2); // Move to OTP input step
                            setError(''); // Clear any previous errors
                            success = true;
                            break;
                        }
                    } catch (endpointError) {
                        console.log(`❌ Failed ${endpoint}:`, endpointError.response?.status || endpointError.message);
                        lastError = endpointError;
                        continue;
                    }
                }

                if (!success) {
                    // If all endpoints failed, show the last error
                    throw lastError;
                }

            } catch (err) {
                console.error('Send OTP error:', err);
                if (err.response) {
                    console.log('Error response data:', err.response.data);
                    console.log('Error status:', err.response.status);
                    
                    const errorMessage = err.response.data?.message ||
                        err.response.data?.detail ||
                        err.response.data?.error ||
                        err.response.data?.non_field_errors?.[0] ||
                        `Server error (${err.response.status}): ${err.response.statusText || 'Check backend OTP endpoint'}`;
                    setError(errorMessage);
                } else if (err.request) {
                    setError(`Connection failed: Make sure Django server is running on ${API_BASE_URL}`);
                } else {
                    setError(`Error: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
            */
        } else if (step === 2) {
            // Second step: Verify OTP and login
            if (!formData.otp.trim()) {
                setError('Please enter your OTP');
                setIsLoading(false);
                return;
            }

            // Development Mode: Simulate OTP verification
            // Remove this block when backend is ready
            console.log('🚧 Development Mode: Simulating OTP verification...');
            
            // For development, accept any 4 digit OTP
            const otpPattern = /^\d{4}$/;
            if (!otpPattern.test(formData.otp.trim())) {
                setError('Please enter a complete 4-digit OTP');
                setIsLoading(false);
                return;
            }

            // Simulate successful login after 1 second
            setTimeout(() => {
                console.log(`✅ Simulated login successful for: ${formData.phone_number} with OTP: ${formData.otp}`);
                localStorage.setItem('authToken', 'dev_token_12345'); // Simulated token
                alert(`🎉 Development Login Successful!\n\nPhone: ${formData.phone_number}\nOTP: ${formData.otp}\n\nRedirecting to orders page...`);
                router.push('/account/orders');
                setIsLoading(false);
            }, 1000);
            return;

            // Production Code: (Uncomment when backend is ready)
            /*
            try {
                const response = await axios.post(`${API_BASE_URL}/api/authentication/token/`, {
                    phone_number: formData.phone_number.trim(),
                    otp: formData.otp.trim(),
                }, {
                    timeout: 10000,
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
                    setError('Login failed. Invalid OTP.');
                }
            } catch (err) {
                console.error('Login error:', err);
                if (err.response) {
                    const errorMessage = err.response.data?.message ||
                        err.response.data?.detail ||
                        err.response.data?.error ||
                        err.response.data?.non_field_errors?.[0] ||
                        `Server error (${err.response.status}): Invalid OTP`;
                    setError(errorMessage);
                } else if (err.request) {
                    setError(`Connection failed: Make sure Django server is running on ${API_BASE_URL}`);
                } else {
                    setError(`Error: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
            */
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
                        {step === 1 ? 'Sign in to your account' : 'Enter OTP'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 
                            ? 'Welcome back! Please enter your phone number.' 
                            : `We've sent an OTP to ${formData.phone_number}`
                        }
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="space-y-6">
                            {step === 1 ? (
                                // Step 1: Phone Number Input
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
                            ) : (
                                // Step 2: OTP Input
                                <>
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
                                            disabled
                                            className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
                                            value={formData.phone_number}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="otp-0"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            OTP (One-Time Password)
                                        </label>
                                        <div className="flex justify-center space-x-3">
                                            {otpDigits.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength="1"
                                                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    autoComplete="off"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

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
                            <div className="space-y-3">
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
                                            {step === 1 ? 'Sending OTP...' : 'Signing in...'}
                                        </div>
                                    ) : (
                                        step === 1 ? 'Send OTP' : 'Sign In'
                                    )}
                                </button>
                                
                                {step === 2 && (
                                    <button
                                        type="button"
                                        onClick={handleBackToPhone}
                                        className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                        Back to Phone Number
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
