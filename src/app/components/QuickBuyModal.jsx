"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';

const QuickBuyModal = ({ product, isOpen, onClose, toast }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart } = useCartStore();

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && product) {
      const sizes = getAvailableSizes();
      setSelectedSize(sizes.length > 0 ? sizes[0] : '');
      setQuantity(1);
      setIsAddingToCart(false);
    }
  }, [isOpen, product]);

  // Handle adding to cart
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
      
      // Close modal after successful add
      onClose();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
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

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Buy
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Product Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0].image_url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-lg font-bold text-orange-600">{formatPrice(product.start_price)}</p>
                {product.category_name && (
                  <p className="text-sm text-gray-500 mt-1">{product.category_name}</p>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Select Size: {selectedSize && <span className="text-orange-600">{selectedSize}</span>}
              </h5>
              <div className="grid grid-cols-5 gap-2">
                {getAvailableSizes().map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 text-sm font-medium border-2 rounded-md transition-all duration-200 ${
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

            {/* Quantity Selection */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Quantity</h5>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedSize}
              className={`flex-1 rounded-lg font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e2939] ${
                isAddingToCart || !selectedSize
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#1e2939] text-white hover:bg-[#141a26]'
              }`}
            >
              <span className="flex items-center justify-center px-4 py-2">
                {isAddingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9.5M7 13h10" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBuyModal;
