"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import ToastContainer, { useToast } from '../components/Toast';
import { getAuthHeaders } from '../../utils/auth';
import { useWishlist } from '../../contexts/WishlistContext';
import { API_BASE_URL, ECOM_ENDPOINTS, getCategoryProductsUrl } from '../../utils/apiConfig';
import logo from "../../assets/logo.jpg";

function ProductListContent() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');

    // Use cart store and toast
    const { addToCart } = useCartStore();
    const { toasts, removeToast, toast } = useToast();
    
    // Use wishlist context
    const { 
        isInWishlist, 
        toggleWishlistItem, 
        loading: wishlistLoading 
    } = useWishlist();

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
                endpoint = getCategoryProductsUrl(categoryId);
            } else {
                // Fetch all products
                endpoint = ECOM_ENDPOINTS.products;
            }

            const response = await axios.get(endpoint, {
                timeout: 10000,
                headers: getAuthHeaders()
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
                setError('Connection failed: Make sure Django server is running on ' + API_BASE_URL);
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

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        
        // For products page, we'll add with a default medium size
        const defaultSize = 'M';
        
        addToCart(product, defaultSize, 1);
        
        toast.success(`Added ${product.name} to cart!`);
        
        // Dispatch custom event to update header cart count
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Handle wishlist toggle
    const handleWishlistToggle = async (product, e) => {
        e.stopPropagation();
        
        const productData = {
            id: product.id,
            name: product.name,
            start_price: product.start_price,
            images: product.images,
            category_name: product.category_name
        };

        await toggleWishlistItem(product.id, productData);
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Main Content */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    {/* Breadcrumb and Page Header */}
                    <div className="mb-8">
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                                        </svg>
                                        Home
                                    </Link>
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
                                <div 
                                    key={product.id} 
                                    className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                    onClick={() => handleViewProduct(product.id)}
                                >
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
                                        {product.end_price && product.end_price > product.start_price && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">
                                                {Math.round(((product.end_price - product.start_price) / product.end_price) * 100)}% OFF
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
                                {formatPrice(product.start_price)}
                            </p>
                            {product.end_price && product.end_price > product.start_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.end_price)}
                                </span>
                            )}
                        </div>                                        {/* Product Title */}
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
                                                onClick={(e) => handleAddToCart(product, e)}
                                                className="flex-1 rounded-sm bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-gray-800"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={(e) => handleWishlistToggle(product, e)}
                                                disabled={wishlistLoading}
                                                className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition hover:scale-105 relative ${
                                                    isInWishlist(product.id)
                                                        ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } ${wishlistLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {wishlistLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </span>
                                                ) : isInWishlist(product.id) ? (
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

function ProductListFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
    );
}

export default function ProductList() {
    return (
        <Suspense fallback={<ProductListFallback />}>
            <ProductListContent />
        </Suspense>
    );
}
