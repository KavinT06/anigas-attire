"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import logo from "../../../assets/logo.jpg";

export default function ProductDetail({ params }) {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    
    // Unwrap params Promise using React.use()
    const resolvedParams = React.use(params);
    const productId = resolvedParams.id;

    // Configure your Django backend URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await axios.get(`${API_BASE_URL}/api/ecom/products/${productId}/`, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                setProduct(response.data);
            } else {
                setError('Failed to fetch product details');
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            
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
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 rounded-lg shadow-lg"
                    >
                        Back to Products
                    </button>
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
                            <a href="/products" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Products</a>
                            <a href="/login" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Log in</a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Product Detail */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    {/* Breadcrumb */}
                    <nav className="flex mb-8" aria-label="Breadcrumb">
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
                                    <a href="/products" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Products</a>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate">
                                        {product?.name || 'Product Details'}
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    {product && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Product Image Gallery */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            width={600}
                                            height={600}
                                            className="object-contain w-full h-96 lg:h-[500px]"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-96 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
                                            <div className="text-center">
                                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-lg text-gray-500">No Image Available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Thumbnail Images */}
                                {product.images && product.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {product.images.slice(0, 4).map((image, index) => (
                                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                                                <Image
                                                    src={image.image_url}
                                                    alt={`${product.name} - Image ${index + 1}`}
                                                    width={150}
                                                    height={150}
                                                    className="object-contain w-full h-20 lg:h-24"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <div className="space-y-6">
                                    {/* Product Title */}
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {product.name}
                                        </h1>
                                        {product.category_name && (
                                            <span className="inline-block px-3 py-1 text-sm font-medium text-orange-600 bg-orange-50 rounded-full">
                                                {product.category_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    {product.rating && (
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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

                                    {/* Price */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.original_price && product.original_price > product.price && (
                                                <span className="text-lg text-gray-500 line-through">
                                                    {formatPrice(product.original_price)}
                                                </span>
                                            )}
                                        </div>
                                        {product.original_price && product.original_price > product.price && (
                                            <div className="text-sm text-green-600 font-medium">
                                                Save {formatPrice(product.original_price - product.price)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {product.description && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Product Details */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                                        <dl className="space-y-3">
                                            {product.sku && (
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">SKU</dt>
                                                    <dd className="text-sm text-gray-900">{product.sku}</dd>
                                                </div>
                                            )}
                                            {product.brand && (
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Brand</dt>
                                                    <dd className="text-sm text-gray-900">{product.brand}</dd>
                                                </div>
                                            )}
                                            {product.availability && (
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Availability</dt>
                                                    <dd className="text-sm text-gray-900">{product.availability}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-4 pt-6">
                                        <button className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 rounded-lg shadow-lg">
                                            Add to Cart
                                        </button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => router.push('/products')}
                                                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Back to Products
                                            </button>
                                            <button className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-orange-600 transition-all duration-200 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100">
                                                Add to Wishlist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
