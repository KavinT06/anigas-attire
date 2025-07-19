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
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-3 border border-white/20 backdrop-blur-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.95) 100%)'
                                    }}
                                >
                                    {/* Animated Background Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-green-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    
                                    {/* Floating Glow Effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700"></div>
                                    
                                    {/* Product Image Container */}
                                    <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 via-white to-gray-100">
                                        {product.images ? (
                                            <div className="relative aspect-square">
                                                <Image
                                                    src={product.images[0].image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-2"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                />
                                                {/* Dynamic overlay with animated gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                                            </div>
                                        ) : (
                                            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-50">
                                                <div className="text-center opacity-60">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-400 font-medium">No Image Available</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Floating Product Badges */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                                            {product.is_new && (
                                                <span className="inline-flex items-center px-4 py-2 text-xs font-bold tracking-wider text-emerald-700 uppercase bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-full shadow-lg border border-emerald-200/50 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                                                    ✨ New
                                                </span>
                                            )}
                                            {product.is_sale && (
                                                <span className="inline-flex items-center px-4 py-2 text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                                    🔥 Sale
                                                </span>
                                            )}
                                        </div>

                                        {/* Dynamic Discount Badge */}
                                        {product.original_price && product.original_price > product.price && (
                                            <div className="absolute bottom-6 left-6 z-10">
                                                <div className="relative">
                                                    <span className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                        💰 {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info with Glass Effect */}
                                    <div className="relative p-8 bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-lg border-t border-white/20">
                                        {/* Category Tag */}
                                        {product.category_name && !categoryId && (
                                            <div className="mb-4">
                                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200/50">
                                                    🏷️ {product.category_name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Product Title */}
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 transition-all duration-300">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Premium Rating Stars */}
                                        {product.rating && (
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="relative">
                                                            <svg
                                                                className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'} transition-all duration-300 hover:scale-125`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            {i < Math.floor(product.rating) && (
                                                                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-30"></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {product.rating} ⭐
                                                </span>
                                            </div>
                                        )}

                                        {/* Enhanced Description */}
                                        {product.description && (
                                            <div className="text-sm text-gray-700 mb-6">
                                                <p className="leading-relaxed">
                                                    {expandedDescriptions.has(product.id) 
                                                        ? product.description 
                                                        : getTruncatedDescription(product.description, 12)
                                                    }
                                                </p>
                                                {product.description.split(' ').length > 12 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDescription(product.id);
                                                        }}
                                                        className="mt-3 inline-flex items-center text-orange-500 hover:text-orange-600 font-semibold text-xs transition-all duration-200 group/btn bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200/50"
                                                    >
                                                        {expandedDescriptions.has(product.id) ? (
                                                            <>
                                                                <span>Show less</span>
                                                                <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover/btn:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>Read more</span>
                                                                <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover/btn:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Premium Price Section */}
                                        <div className="flex items-end justify-between pt-6 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {product.original_price && product.original_price > product.price && (
                                                        <span className="text-lg text-gray-400 line-through opacity-75">
                                                            {formatPrice(product.original_price)}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg inline-flex items-center">
                                                        💵 Save {formatPrice(product.original_price - product.price)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={() => handleViewProduct(product.id)}
                                                className="relative px-8 py-4 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group/btn"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <span>Shop Now</span>
                                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Animated Border Glow */}
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-sm"></div>
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

                    {/* Additional Actions */}
                    {products.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Products
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
