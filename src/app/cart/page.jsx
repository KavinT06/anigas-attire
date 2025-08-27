'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import ToastContainer, { useToast } from '../components/Toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';

const CartPage = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  
  const { toasts, removeToast, toast } = useToast();

  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  const handleQuantityChange = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, size);
      return;
    }
    updateQuantity(productId, size, newQuantity);
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = (productId, size) => {
    removeFromCart(productId, size);
    toast.success('Item removed from cart');
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          
          <div className="py-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9.5M7 13h10M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8M7 13H5.4M7 13l10 0" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors duration-200"
              >
                Continue Shopping
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="py-8 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Profile Completion Banner */}
        <ProfileCompletionBanner currentPage="cart" />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
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

                      {/* Product Info */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link
                                href={`/product/${item.productId}`}
                                className="hover:text-orange-600 transition-colors duration-200"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-gray-500">Size: {item.size}</p>
                              {item.category && (
                                <p className="text-sm text-gray-500">Category: {item.category}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-lg font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity and Remove */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 text-gray-900 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId, item.size)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Subtotal: {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">Free</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">Calculated at checkout</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/checkout"
                  className="block w-full bg-orange-500 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Free shipping on orders over $50
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default CartPage;
