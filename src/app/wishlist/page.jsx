"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const WishlistPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const {
    wishlistItems,
    loading,
    initialized,
    removeItemFromWishlist,
    loadWishlist,
    getWishlistCount
  } = useWishlist();

  // Load wishlist on component mount (only if not already initialized and no recent load)
  useEffect(() => {
    // Only trigger once when the component mounts and user is logged in
    if (isLoggedIn && !initialized) {
      loadWishlist();
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle remove from wishlist
  const handleRemoveItem = async (productId, productName) => {
    if (window.confirm(`Remove "${productName}" from your wishlist?`)) {
      const result = await removeItemFromWishlist(productId);
      
      if (!result.success) {
        toast.error(result.error?.message || 'Failed to remove item');
      } else {
        toast.success('Item removed from wishlist');
      }
    }
  };

  // Handle view product
  const handleViewProduct = (productId) => {
    router.push(`/product/${productId}`);
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    router.push('/products');
  };

  // Format price
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
      return 'Price not available';
    }
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) {
      return 'Price not available';
    }
    
    return `₹${numPrice.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  // Get product image URL
  const getProductImage = (item) => {
    // Handle different possible data structures from backend
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].image_url || item.product.images[0].image;
    }
    if (item.product?.image) {
      return item.product.image;
    }
    if (item.image) {
      return item.image;
    }
    return '/placeholder-product.svg'; // Fallback image
  };

  // Get product name
  const getProductName = (item) => {
    return item.product?.name || item.name || `Product ${item.product_id || item.id}`;
  };

  // Get product price
  const getProductPrice = (item) => {
    return item.product?.start_price || item.product?.price || item.price || 0;
  };

  // Get product ID for navigation
  const getProductId = (item) => {
    // For navigation and removal, we want the actual product ID, not the wishlist item ID
    // Priority: product object ID > product_id field > fallback to item id
    const productId = item.product?.id || item.product_id;
    
    // Only fallback to item.id if we have no other option (shouldn't happen normally)
    const finalId = productId || item.id;
    
    return finalId;
  };

  // Loading state
  if (loading && !initialized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg h-80"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    My Wishlist
                  </h1>
                  <p className="text-orange-100">
                    {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved for later
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg 
                    className="w-16 h-16 text-orange-200" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {wishlistItems.length === 0 ? (
                // Empty state
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Start adding products to your wishlist by clicking the heart icon on products you love.
                  </p>
                  <button 
                    onClick={handleContinueShopping}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Explore Products
                  </button>
                </div>
              ) : (
                // Wishlist items
                <div>
                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">
                        Showing {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <button 
                      onClick={handleContinueShopping}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Continue Shopping
                    </button>
                  </div>

                  {/* Wishlist Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item, index) => {
                      const productId = getProductId(item);
                      const productName = getProductName(item);
                      const productPrice = getProductPrice(item);
                      const productImage = getProductImage(item);

                      return (
                        <div 
                          key={productId || `wishlist-item-${index}`} 
                          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => handleViewProduct(productId)}
                              onError={(e) => {
                                e.target.src = '/placeholder-product.svg';
                              }}
                            />
                            
                            {/* Remove Button - Top Right */}
                            <button
                              onClick={() => handleRemoveItem(productId, productName)}
                              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 group/btn"
                              aria-label="Remove from wishlist"
                            >
                              <svg 
                                className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <h3 
                              className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors duration-200"
                              onClick={() => handleViewProduct(productId)}
                            >
                              {productName}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-orange-600">
                                {formatPrice(productPrice)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 space-y-2">
                              <button
                                onClick={() => handleViewProduct(productId)}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-md hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 font-medium"
                              >
                                View Product
                              </button>
                              
                              <button
                                onClick={() => handleRemoveItem(productId, productName)}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WishlistPage;
