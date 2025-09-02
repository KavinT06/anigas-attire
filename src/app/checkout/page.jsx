'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import ToastContainer, { useToast } from '../components/Toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import { useProfile } from '../../hooks/useProfile';
import { 
  createOrder, 
  getCart, 
  addToCart,
  removeFromCart,
  getAddresses, 
  createAddress,
  initiatePayment 
} from '../../services/api/orders';
import api from '../../utils/axiosInstance';
import { ECOM_ENDPOINTS } from '../../utils/apiConfig';

const CheckoutPage = () => {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { toasts, removeToast, toast } = useToast();
  const { profile, loading: profileLoading, fetchProfile, getProfileField } = useProfile();
  
  // Form states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    phone: ''
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Load profile data and addresses on mount
  useEffect(() => {
    fetchProfile(false);
    loadAddresses();
  }, [fetchProfile]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const result = await getAddresses();
      if (result.success) {
        const addressList = result.data.results || result.data || [];
        setAddresses(addressList);
        // Auto-select first address if available
        if (addressList.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addressList[0].id);
        }
      } else {
        console.error('Failed to load addresses:', result.error);
        // Don't show error toast for empty addresses
        if (result.error?.status !== 404) {
          toast.error('Failed to load addresses');
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const validateNewAddress = () => {
    const errors = {};
    
    if (!newAddress.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!newAddress.street.trim()) {
      errors.street = 'Street address is required';
    }
    if (!newAddress.city.trim()) {
      errors.city = 'City is required';
    }
    if (!newAddress.state.trim()) {
      errors.state = 'State is required';
    }
    if (!newAddress.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    }
    if (!newAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(newAddress.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOrder = () => {
    const errors = {};
    
    if (!selectedAddressId && !showNewAddressForm) {
      errors.address = 'Please select a delivery address';
    }
    
    if (showNewAddressForm && !validateNewAddress()) {
      errors.newAddress = 'Please fill all required address fields';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewAddress = async () => {
    if (!validateNewAddress()) {
      toast.error('Please fix the address form errors');
      return;
    }

    try {
      const result = await createAddress(newAddress);
      if (result.success) {
        toast.success('Address added successfully');
        setAddresses(prev => [...prev, result.data]);
        setSelectedAddressId(result.data.id);
        setShowNewAddressForm(false);
        setNewAddress({
          name: '',
          street: '',
          city: '',
          state: '',
          postal_code: '',
          phone: ''
        });
        setFormErrors({});
      } else {
        toast.error(result.error?.message || 'Failed to add address');
      }
    } catch (error) {
      toast.error('Error adding address');
      console.error('Error adding address:', error);
    }
  };

  // Helper function to batch fetch product variants for all cart items
  const batchFetchVariants = async (cartItems) => {
    const variantMap = {};
    const uniqueProductIds = [...new Set(cartItems.map(item => item.productId))];
    
    try {
      // Fetch all unique products in parallel
      const productPromises = uniqueProductIds.map(productId => 
        api.get(`${ECOM_ENDPOINTS.products}${productId}/`)
          .then(response => ({ productId, data: response.data }))
          .catch(error => ({ productId, error: true }))
      );
      
      const productResults = await Promise.all(productPromises);
      
      // Build variant map
      productResults.forEach(result => {
        if (!result.error && result.data?.variants) {
          result.data.variants.forEach(variant => {
            variantMap[`${result.productId}-${variant.name}`] = variant.id;
          });
        }
      });
      
      return variantMap;
    } catch (error) {
      console.warn('Error batch fetching variants:', error);
      return {};
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) {
      toast.error('Please fix the form errors before proceeding');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Step 1: Sync frontend cart to backend cart
      toast.info('Syncing cart with backend...', { duration: 2000 });
      
      // Batch fetch all variant IDs for cart items
      const variantMap = await batchFetchVariants(items);
      
      // Clear backend cart first to ensure clean state
      try {
        const backendCartResult = await getCart();
        if (backendCartResult.success && backendCartResult.data && backendCartResult.data.items && backendCartResult.data.items.length > 0) {
          // Remove all existing items from backend cart
          for (const item of backendCartResult.data.items) {
            await removeFromCart(item.variant_id || item.id);
          }
        }
      } catch (error) {
        console.warn('Failed to clear backend cart:', error);
        // Continue anyway, as this is not critical
      }

      // Add all frontend cart items to backend cart
      let syncSuccessCount = 0;
      let syncErrorCount = 0;
      
      for (const item of items) {
        try {
          // Get variant ID from the batch-fetched map
          const variantKey = `${item.productId}-${item.size}`;
          const variantId = variantMap[variantKey] || item.size; // fallback to size name
          
          const addToCartResult = await addToCart({
            product_id: item.productId,
            product_variant: variantId,
            quantity: item.quantity
          });
          
          if (addToCartResult.success) {
            syncSuccessCount++;
          } else {
            syncErrorCount++;
            console.warn(`Failed to add item ${item.name} to backend cart:`, addToCartResult.error);
          }
        } catch (error) {
          syncErrorCount++;
          console.warn(`Error adding item ${item.name} to backend cart:`, error);
        }
      }

      // Check if cart sync was successful
      if (syncErrorCount > 0) {
        console.warn(`Cart sync completed with ${syncErrorCount} errors out of ${items.length} items`);
        if (syncSuccessCount === 0) {
          throw new Error('Failed to sync cart with backend. Please try again.');
        }
      }

      toast.success(`Cart synced: ${syncSuccessCount} items added to backend`, { duration: 2000 });

      // Step 2: Create address if needed
      let addressId = selectedAddressId;
      if (showNewAddressForm && !selectedAddressId) {
        const addressResult = await createAddress(newAddress);
        if (addressResult.success) {
          addressId = addressResult.data.id;
        } else {
          throw new Error('Failed to create address');
        }
      }

      // Step 3: Prepare order payload according to backend requirements
      const orderPayload = {
        address_id: addressId,
        payment_method: paymentMethod,
        ...(couponCode.trim() && { coupon_code: couponCode.trim() }),
        ...(notes.trim() && { notes: notes.trim() })
      };

      // Step 4: Create the order
      const orderResult = await createOrder(orderPayload);
      
      if (orderResult.success) {
        const newOrder = orderResult.data;
        toast.success('Order placed successfully!');

        // Handle payment processing
        if (paymentMethod === 'COD') {
          // For COD, clear cart and redirect to order details
          clearCart();
          window.dispatchEvent(new Event('cartUpdated'));
          
          setTimeout(() => {
            router.push(`/orders/${newOrder.id || newOrder.order_id}`);
          }, 500);
        } else {
          // For online payment methods, initiate payment
          try {
            const paymentResult = await initiatePayment({
              order_id: newOrder.id || newOrder.order_id,
              payment_method: paymentMethod
            });

            if (paymentResult.success) {
              const paymentData = paymentResult.data;
              
              // Handle different payment gateways
              if (paymentMethod === 'RAZORPAY' && paymentData.key && paymentData.order_id) {
                // Initialize Razorpay checkout
                if (typeof window !== 'undefined' && window.Razorpay) {
                  const options = {
                    key: paymentData.key,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'INR',
                    order_id: paymentData.order_id,
                    name: 'Anigas Attire',
                    description: `Order #${newOrder.id || newOrder.order_id}`,
                    handler: function (response) {
                      // Payment successful
                      clearCart();
                      window.dispatchEvent(new Event('cartUpdated'));
                      toast.success('Payment successful!');
                      router.push(`/orders/${newOrder.id || newOrder.order_id}`);
                    },
                    modal: {
                      ondismiss: function () {
                        toast.warning('Payment cancelled');
                      }
                    }
                  };
                  
                  const rzp = new window.Razorpay(options);
                  rzp.open();
                } else {
                  throw new Error('Razorpay not loaded');
                }
              } else if (paymentData.payment_url) {
                // Redirect to payment gateway URL (PhonePe, PayTM, etc.)
                window.location.href = paymentData.payment_url;
              } else {
                throw new Error('Invalid payment response');
              }
            } else {
              throw new Error(paymentResult.error?.message || 'Payment initiation failed');
            }
          } catch (paymentError) {
            console.error('Payment error:', paymentError);
            toast.error('Payment setup failed. Order created but payment pending.');
            // Still redirect to order page to show the order
            setTimeout(() => {
              router.push(`/orders/${newOrder.id || newOrder.order_id}`);
            }, 2000);
          }
        }
      } else {
        throw new Error(orderResult.error?.message || 'Failed to create order');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Don't render if cart is empty (will redirect)
  if (items.length === 0) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="py-8 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Review your order and complete your purchase
          </p>
        </div>

        {/* Profile Completion Banner */}
        <ProfileCompletionBanner currentPage="checkout" />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Order Summary */}
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {item.category && (
                          <p className="text-sm text-gray-500">Category: {item.category}</p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h2>
              
              {loadingAddresses ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  {/* Existing Addresses */}
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="selectedAddress"
                            checked={selectedAddressId === address.id && !showNewAddressForm}
                            onChange={() => {
                              setSelectedAddressId(address.id);
                              setShowNewAddressForm(false);
                              setFormErrors({});
                            }}
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`address-${address.id}`} 
                            className="flex-1 text-sm cursor-pointer"
                          >
                            <div className="font-medium text-gray-900">{address.name}</div>
                            <div className="text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.postal_code}
                            </div>
                            {address.phone && (
                              <div className="text-gray-500">Phone: {address.phone}</div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address Option */}
                  <div className="flex items-start space-x-3 mb-4">
                    <input
                      type="radio"
                      id="new-address"
                      name="selectedAddress"
                      checked={showNewAddressForm}
                      onChange={() => {
                        setShowNewAddressForm(true);
                        setSelectedAddressId('');
                        setFormErrors({});
                      }}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="new-address" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Add new address
                    </label>
                  </div>

                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name *</label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                              formErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Full name"
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone *</label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                              formErrors.phone ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Phone number"
                          />
                          {formErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                        <textarea
                          value={newAddress.street}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          rows={2}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                            formErrors.street ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Street address, apartment, suite, etc."
                        />
                        {formErrors.street && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City *</label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                              formErrors.city ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="City"
                          />
                          {formErrors.city && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State *</label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                              formErrors.state ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="State"
                          />
                          {formErrors.state && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                              formErrors.postal_code ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Postal code"
                          />
                          {formErrors.postal_code && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleAddNewAddress}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  )}

                  {formErrors.address && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {[
                  { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                  { id: 'RAZORPAY', name: 'Credit/Debit Card', desc: 'Pay online using Razorpay' },
                  { id: 'PHONEPE', name: 'PhonePe', desc: 'Pay using PhonePe wallet' },
                  { id: 'PAYTM', name: 'Paytm', desc: 'Pay using Paytm wallet' }
                ].map((method) => (
                  <div key={method.id} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.desc}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Options</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter coupon code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special instructions for your order"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Total & Checkout */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Total</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900 font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || loadingAddresses}
                className={`mt-6 w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isPlacingOrder || loadingAddresses
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isPlacingOrder ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ${formatPrice(totalPrice)}`
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
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

export default CheckoutPage;
