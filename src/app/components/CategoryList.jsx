"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { getAuthHeaders } from '../../utils/auth';
import logo from "../../assets/logo.jpg";

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Configure your Django backend URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5025';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await axios.get(`${API_BASE_URL}/api/ecom/categories/`, {
                timeout: 10000,
                headers: getAuthHeaders()
            });

            if (response.status === 200) {
                setCategories(response.data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            
            if (err.response) {
                const errorMessage = err.response.data?.message || 
                    err.response.data?.detail || 
                    `Server error (${err.response.status})`;
                setError(errorMessage);
            } else if (err.request) {
                setError('Connection failed: Make sure Django server is running on http://localhost:5025');
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/products?category=${categoryId}`);
    };

    const handleViewAllProducts = () => {
        router.push('/products');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <div className="flex-shrink-0 inline-flex">
                            <a href="/" title="" className="flex">
                                <Image className="w-auto h-7 xl:h-10 xl:ml-28 rounded-lg" src={logo} alt="Aniga's Attire Logo" />
                            </a>
                            <p className='text-xl ml-1.5 mt-0.5 font-bold text-black'>Aniga's Attire</p>
                        </div>
                        <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
                            <a href="/" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Home</a>
                            <a href="/categories" title="" className="text-base font-semibold text-orange-500 transition-all duration-200 hover:text-opacity-80">Categories</a>
                            <a href="/products" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">All Products</a>
                            <a href="/login" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Log in</a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                            Shop by Category
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our wide range of premium fashion categories. Find exactly what you're looking for.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
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

                    {/* View All Products Button */}
                    <div className="text-center mb-8">
                        <button
                            onClick={handleViewAllProducts}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 rounded-lg shadow-lg"
                        >
                            View All Products
                        </button>
                    </div>

                    {/* Categories Grid */}
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <div 
                                    key={category.id} 
                                    className="rounded-xl bg-white shadow-lg shadow-gray-300 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-gray-400 transition-shadow duration-300"
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {/* Category Image */}
                                    {category.image_url ? (
                                        <Image
                                            src={category.image_url}
                                            alt={category.name}
                                            width={400}
                                            height={300}
                                            className="w-full h-48 sm:h-56 object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-48 sm:h-56 bg-gray-200 flex items-center justify-center">
                                            <div className="text-center">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <p className="text-sm text-gray-400">No Image</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Section */}
                                    <div className="w-full p-6">
                                        <h5 className="text-xl font-semibold text-gray-900 mb-4">
                                            {category.name}
                                        </h5>
                                        
                                        {category.description ? (
                                            <p className="text-sm font-medium text-gray-600 mb-3">
                                                {category.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-600 mb-3">
                                                Discover our premium collection of {category.name.toLowerCase()}. Browse through high-quality items carefully selected for you.
                                            </p>
                                        )}

                                        {/* Product Count */}
                                        {category.product_count !== undefined && (
                                            <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                                                {category.product_count} {category.product_count === 1 ? 'product' : 'products'} available
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoading && !error && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                                <p className="text-gray-600">There are no categories available at the moment.</p>
                            </div>
                        )
                    )}

                    {/* Additional Actions */}
                    {categories.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Categories
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
