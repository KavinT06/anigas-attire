"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import logo from "../../assets/logo.jpg";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');

    // Configure your Django backend URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError('');

            let endpoint;
            if (categoryId) {
                // Fetch products for specific category
                endpoint = `${API_BASE_URL}/api/ecom/category-products/${categoryId}/`;
            } else {
                // Fetch all products
                endpoint = `${API_BASE_URL}/api/ecom/products/`;
            }

            const response = await axios.get(endpoint, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                // Handle different response structures
                if (response.data.products) {
                    // If response has products array and category info
                    setProducts(response.data.products);
                    setCategoryName(response.data.category_name || '');
                } else if (response.data.results) {
                    // If response has paginated results
                    setProducts(response.data.results);
                    setCategoryName(response.data.category_name || '');
                } else if (Array.isArray(response.data)) {
                    // If response is directly an array of products
                    setProducts(response.data);
                } else {
                    setError('Invalid response format');
                }
            } else {
                setError('Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            
            if (err.response) {
                const errorMessage = err.response.data?.message || 
                    err.response.data?.detail || 
                    `Server error (${err.response.status})`;
                setError(errorMessage);
            } else if (err.request) {
                setError('Connection failed: Make sure Django server is running on http://localhost:8000');
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewProduct = (productId) => {
        // Navigate to product detail page (you can implement this later)
        router.push(`/product/${productId}`);
    };

    const toggleDescription = (productId) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const getTruncatedDescription = (description, wordLimit = 20) => {
        if (!description) return '';
        const words = description.split(' ');
        if (words.length <= wordLimit) return description;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        return price || 'Price not available';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
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
                            <a href="/categories" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Categories</a>
                            <a href="/products" title="" className="text-base font-semibold text-orange-500 transition-all duration-200 hover:text-opacity-80">All Products</a>
                            <a href="/login" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Log in</a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    {/* Breadcrumb and Page Header */}
                    <div className="mb-8">
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li className="inline-flex items-center">
                                    <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                                        </svg>
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                        {categoryId ? (
                                            <a href="/categories" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Categories</a>
                                        ) : (
                                            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Products</span>
                                        )}
                                    </div>
                                </li>
                                {categoryId && (
                                    <li aria-current="page">
                                        <div className="flex items-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                                                {categoryName || `Category ${categoryId}`}
                                            </span>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </nav>

                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                            {categoryId ? (categoryName || `Category Products`) : 'All Products'}
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                            {categoryId 
                                ? `Discover all products in ${categoryName || 'this category'}`
                                : 'Browse our complete collection of premium fashion items'
                            }
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        {categoryId && (
                            <button
                                onClick={() => router.push('/products')}
                                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                View All Products
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/categories')}
                            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Browse Categories
                        </button>
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

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                            {products.map((product) => (
                                <div key={product.id} className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                    {/* Product Badges */}
                                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                        {product.is_new && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                                                New
                                            </span>
                                        )}
                                        {product.is_sale && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                                Sale
                                            </span>
                                        )}
                                        {product.original_price && product.original_price > product.price && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">
                                                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {/* Product Image */}
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            width={300}
                                            height={240}
                                            className="h-48 w-full object-contain transition duration-500 group-hover:scale-105 sm:h-52"
                                        />
                                    ) : (
                                        <div className="h-48 sm:h-52 w-full bg-gray-200 flex items-center justify-center">
                                            <div className="text-center">
                                                <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-400">No Image Available</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="relative border border-gray-100 p-4" style={{ backgroundColor: '#f5f5f5' }}>
                                        {/* Category */}
                                        {product.category_name && !categoryId && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-full mb-2">
                                                {product.category_name}
                                            </span>
                                        )}

                                        {/* Price */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-base font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.original_price && product.original_price > product.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    {formatPrice(product.original_price)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Title */}
                                        <h3 className="text-base font-medium text-gray-900 mb-1">
                                            {product.name}
                                        </h3>

                                        {/* Rating */}
                                        {product.rating && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">({product.rating})</span>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {product.description && (
                                            <div className="mb-3">
                                                <p className={`text-sm text-gray-700 ${expandedDescriptions.has(product.id) ? '' : 'line-clamp-3'}`}>
                                                    {expandedDescriptions.has(product.id) 
                                                        ? product.description 
                                                        : getTruncatedDescription(product.description, 15)
                                                    }
                                                </p>
                                                {product.description.split(' ').length > 15 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDescription(product.id);
                                                        }}
                                                        className="mt-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                                                    >
                                                        {expandedDescriptions.has(product.id) ? 'Show less' : 'Read more'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add to cart functionality
                                                }}
                                                className="flex-1 rounded-sm bg-orange-100 px-3 py-2 text-sm font-medium text-orange-900 transition hover:scale-105 hover:bg-orange-200"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleViewProduct(product.id)}
                                                className="flex-1 rounded-sm bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-orange-600"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoading && !error && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {categoryId ? 'No products in this category' : 'No products found'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {categoryId 
                                        ? 'This category doesn\'t have any products yet.' 
                                        : 'There are no products available at the moment.'
                                    }
                                </p>
                                <button
                                    onClick={() => router.push('/categories')}
                                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 rounded-lg shadow-lg"
                                >
                                    Browse Categories
                                </button>
                            </div>
                        )
                    )}
                </div>
            </section>
        </div>
    );
}
