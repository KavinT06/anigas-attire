'use client';
import React from 'react';
import useCartStore from '../../store/cartStore';
import Header from '../components/Header';
import ToastContainer, { useToast } from '../components/Toast';

const TestCartPage = () => {
  const { items, addToCart, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { toasts, removeToast, toast } = useToast();

  const testProduct = {
    id: 999,
    name: 'Test Product',
    price: 25.99,
    images: [{ image_url: '/api/placeholder/300/300' }],
    category_name: 'Test Category'
  };

  const handleAddTestItem = () => {
    addToCart(testProduct, 'M', 1);
    toast.success('Test item added to cart!');
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Cart cleared!');
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="py-8 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cart Test Page</h1>
          
          <div className="space-y-4 mb-6">
            <p className="text-lg">
              Total Items: <span className="font-semibold">{getTotalItems()}</span>
            </p>
            <p className="text-lg">
              Total Price: <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
            </p>
          </div>

          <div className="space-x-4 mb-6">
            <button
              onClick={handleAddTestItem}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Add Test Item
            </button>
            <button
              onClick={handleClearCart}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Clear Cart
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Cart Items:</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">No items in cart</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">(Size: {item.size})</span>
                    </div>
                    <div>
                      <span className="font-medium">Qty: {item.quantity}</span>
                      <span className="text-gray-500 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCartPage;
