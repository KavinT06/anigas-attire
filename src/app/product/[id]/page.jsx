"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import useCartStore from '../../../store/cartStore';
import toast, { Toaster } from 'react-hot-toast';
import { getAuthHeaders } from '../../../utils/auth';
import { useWishlist } from '../../../contexts/WishlistContext';
import { API_BASE_URL, getProductUrl } from '../../../utils/apiConfig';

export default function ProductDetail({ params }) {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const router = useRouter();
    
    // Use cart store
    const { addToCart } = useCartStore();
    
    // Use wishlist context
    const { 
        isInWishlist, 
        toggleWishlistItem, 
        loading: wishlistLoading 
    } = useWishlist();
    
    // Unwrap params Promise using React.use()
    const resolvedParams = React.use(params);
    const productId = resolvedParams.id;

    // Get available sizes from product data or fallback to defaults
    const getAvailableSizes = () => {
        // If backend provides sizes in product.variants array (most common case)
        if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            const sizes = product.variants.map(variant => variant.name).filter(Boolean);
            return sizes;
        }
        
        // If backend provides sizes in product.sizes array
        if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            return product.sizes;
        }
        
        // If backend provides sizes in product.available_sizes
        if (product?.available_sizes && Array.isArray(product.available_sizes) && product.available_sizes.length > 0) {
            return product.available_sizes;
        }
        
        // If backend provides sizes in product.variant_names
        if (product?.variant_names && Array.isArray(product.variant_names) && product.variant_names.length > 0) {
            return product.variant_names;
        }
        
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

    // Handle wishlist toggle
    const handleWishlistToggle = async () => {
        if (!product) return;

        const productData = {
            id: product.id,
            name: product.name,
            start_price: product.start_price,
            images: product.images,
            category_name: product.category_name
        };

        await toggleWishlistItem(product.id, productData);
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!product) {
            toast.error('Product not found');
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }

        setIsAddingToCart(true);
        
        try {
            // Use the cart store to add item
            addToCart(product, selectedSize, quantity);
            
            // Trigger storage event for header to update
            window.dispatchEvent(new Event('cartUpdated'));
            
            toast.success(
                `Added ${quantity} ${product.name} (${selectedSize}) to cart!`,
                {
                    duration: 3000,
                    position: 'top-center',
                    icon: '🛒',
                    style: {
                        background: '#22c55e',
                        color: 'white',
                    },
                }
            );
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await axios.get(getProductUrl(productId), {
                timeout: 10000,
                headers: getAuthHeaders()
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
                setError('Connection failed: Make sure Django server is running on ' + API_BASE_URL);
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === '') {
            return 'Price not available';
        }
        
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (typeof numPrice === 'number' && !isNaN(numPrice)) {
            return `₹${numPrice.toFixed(2)}`;
        }
        
        return 'Price not available';
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
            <Toaster />

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
                                        {formatPrice(product.start_price)}
                                    </span>
                                    {product.end_price && product.end_price > product.start_price && (
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatPrice(product.end_price)}
                                        </span>
                                    )}
                                </div>
                                {product.end_price && product.end_price > product.start_price && (
                                    <p className="text-green-600 font-medium">
                                        Save {formatPrice(product.end_price - product.start_price)}
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
                                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                                        isAddingToCart 
                                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || !selectedSize}
                                >
                                    {isAddingToCart ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding to Cart...
                                        </span>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                                
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => router.push('/products')}
                                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Back to Products
                                    </button>
                                    <button 
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistLoading}
                                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 relative ${
                                            isInWishlist(product?.id)
                                                ? 'border border-pink-300 text-pink-600 bg-pink-50 hover:bg-pink-100'
                                                : 'border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'
                                        } ${wishlistLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {wishlistLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {isInWishlist(product?.id) ? 'Removing...' : 'Adding...'}
                                            </span>
                                        ) : isInWishlist(product?.id) ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                                In Wishlist
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                                </svg>
                                                Add to Wishlist
                                            </span>
                                        )}
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
