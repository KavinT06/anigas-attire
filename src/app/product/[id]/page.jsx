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
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();
    
    // Unwrap params Promise using React.use()
    const resolvedParams = React.use(params);
    const productId = resolvedParams.id;

    // Configure your Django backend URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5025';

    // Get available sizes from product data or fallback to defaults
    const getAvailableSizes = () => {
        // Debug: Log the product data to see what we're working with
        console.log('Product data for sizes:', product);
        
        // If backend provides sizes in product.variants array (most common case)
        if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            const sizes = product.variants.map(variant => variant.name).filter(Boolean);
            console.log('Extracted sizes from variants:', sizes);
            return sizes;
        }
        
        // If backend provides sizes in product.sizes array
        if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            console.log('Using product.sizes:', product.sizes);
            return product.sizes;
        }
        
        // If backend provides sizes in product.available_sizes
        if (product?.available_sizes && Array.isArray(product.available_sizes) && product.available_sizes.length > 0) {
            console.log('Using product.available_sizes:', product.available_sizes);
            return product.available_sizes;
        }
        
        // If backend provides sizes in product.variant_names
        if (product?.variant_names && Array.isArray(product.variant_names) && product.variant_names.length > 0) {
            console.log('Using product.variant_names:', product.variant_names);
            return product.variant_names;
        }
        
        console.log('Using fallback sizes - no size data found in backend');
        // Fallback to include S-size in case backend doesn't provide size data
        return ['S', 'M', 'L', 'XL', 'XXL'];
    };

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    // Set default size when product is loaded
    useEffect(() => {
        if (product && !selectedSize) {
            const sizes = getAvailableSizes();
            if (sizes.length > 0) {
                setSelectedSize(sizes[0]);
            }
        }
    }, [product, selectedSize]);

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
                console.log('Fetched product data:', response.data);
                console.log('Product variants:', response.data.variants);
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
                setError('Connection failed: Make sure Django server is running on http://localhost:5025');
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
        <div className="bg-white min-h-screen">
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
            <div className="max-w-6xl mx-auto px-4 py-8">
                {product && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Product Image */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0].image_url}
                                        alt={product.name}
                                        width={500}
                                        height={500}
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-400 text-lg">No Image Available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Title and Category */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                                {product.category_name && (
                                    <p className="text-gray-600 text-lg">
                                        {product.category_name}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <div className="flex items-baseline space-x-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.original_price && product.original_price > product.price && (
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatPrice(product.original_price)}
                                        </span>
                                    )}
                                </div>
                                {product.original_price && product.original_price > product.price && (
                                    <p className="text-green-600 font-medium">
                                        Save {formatPrice(product.original_price - product.price)}
                                    </p>
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
                                    <span className="text-gray-600">({product.rating})</span>
                                </div>
                            )}

                            {/* Size Selection */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Size: {selectedSize && <span className="text-orange-600">{selectedSize}</span>}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {getAvailableSizes().map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 py-3 text-sm font-medium border-2 rounded-lg transition-all duration-200 ${
                                                selectedSize === size
                                                    ? 'border-orange-500 bg-orange-500 text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="space-y-4 pt-4">
                                <button 
                                    className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors duration-200"
                                    onClick={() => {
                                        console.log('Adding to cart:', {
                                            productId: product.id,
                                            size: selectedSize,
                                            quantity
                                        });
                                    }}
                                >
                                    Add to Cart
                                </button>
                                
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => router.push('/products')}
                                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Back to Products
                                    </button>
                                    <button className="flex-1 border border-orange-300 text-orange-600 py-3 px-6 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200">
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
