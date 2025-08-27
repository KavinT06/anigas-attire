'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);

  // Extract order details from query parameters
  useEffect(() => {
    const total = searchParams.get('total');
    const items = searchParams.get('items');
    const address = searchParams.get('address');
    
    if (total && items) {
      const orderData = {
        total: parseFloat(total),
        itemCount: parseInt(items),
        deliveryAddress: address ? decodeURIComponent(address) : null
      };
      setOrderDetails(orderData);
    }
  }, [searchParams]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="py-16 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thank you for your order! We've received your purchase and will begin processing it shortly.
            </p>
          </div>

          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Order Summary
              </h2>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="font-medium text-green-700">Number of Items:</span>
                  <span className="font-semibold text-green-800">{orderDetails.itemCount}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="font-medium text-green-700">Total Amount:</span>
                  <span className="font-semibold text-green-800 text-lg">${orderDetails.total.toFixed(2)}</span>
                </div>
                
                {orderDetails.deliveryAddress && (
                  <div className="py-2">
                    <span className="font-medium text-green-700 block mb-2">Delivery Address:</span>
                    <p className="text-green-800 bg-white rounded p-3 text-sm border border-green-100">
                      {orderDetails.deliveryAddress}
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <span className="font-medium text-green-700 block mb-1">Payment Method:</span>
                  <span className="text-green-800 text-sm">Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What happens next?</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-orange-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">Your order has been received and is being processed.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-orange-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Preparation</h3>
                  <p className="text-sm text-gray-600">We'll carefully package your items for delivery.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-orange-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery</h3>
                  <p className="text-sm text-gray-600">Your order will be delivered to your specified address.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-orange-600">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Payment (COD)</h3>
                  <p className="text-sm text-gray-600">Pay the delivery person when you receive your order.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <h3 className="font-medium text-amber-800 mb-2">Important Notes:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Please keep your phone accessible for delivery coordination</li>
                  <li>• Ensure someone is available at the delivery address</li>
                  <li>• Have the exact payment amount ready for Cash on Delivery</li>
                  <li>• Delivery typically takes 2-5 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
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

          {/* Contact Information */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order or need assistance, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
              >
                Contact Support
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Thank you for choosing Aniga's Attire! 
            </p>
            <p className="text-gray-600">
              We appreciate your business and look forward to serving you again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  const router = useRouter();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
};

export default OrderSuccessPage;
