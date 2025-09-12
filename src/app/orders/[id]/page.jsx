"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { getOrderById } from '../../../services/orders';
import { fetchAddresses } from '../../../services/addresses';

const OrderDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderId = params.id;

    const fetchOrderDetails = async () => {
        if (!orderId) {
            setError('Invalid order ID');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await getOrderById(orderId);
            
            if (result.success) {
                setOrder(result.data);
                
                // Check if we need to fetch address details separately
                if (result.data.address_id && !result.data.shipping_address && !result.data.address) {
                    try {
                        const addressResult = await fetchAddresses();
                        if (addressResult.data && Array.isArray(addressResult.data)) {
                            const matchingAddress = addressResult.data.find(addr => addr.id === result.data.address_id);
                            if (matchingAddress) {
                                setShippingAddress(matchingAddress);
                            }
                        }
                    } catch (addressError) {
                        console.error('Error fetching address details:', addressError);
                        // Don't fail the whole page if address fetch fails
                    }
                }
            } else {
                setError(result.error?.message || 'Failed to fetch order details');
                if (result.error?.status === 404) {
                    setError('Order not found');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Order details fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatPrice = (amount) => {
        if (amount == null) return '₹0.00';
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
            'processing': 'bg-purple-100 text-purple-800 border-purple-200',
            'shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'delivered': 'bg-green-100 text-green-800 border-green-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'refunded': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            
            {/* Items skeleton */}
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2].map(item => (
                        <div key={item} className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const ErrorState = () => (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading order</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
                <button 
                    onClick={fetchOrderDetails}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                    Try Again
                </button>
                <Link 
                    href="/orders"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    Back to Orders
                </Link>
            </div>
        </div>
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <LoadingSkeleton />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ErrorState />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!order) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
                            <Link 
                                href="/orders"
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                                Back to Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link 
                            href="/orders"
                            className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Orders
                        </Link>
                    </div>

                    {/* Order Header */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    Order #{order.id || order.order_id}
                                </h1>
                                <p className="text-gray-600">
                                    Placed on {formatDate(order.created_at || order.created)}
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatPrice(order.total_amount || order.total)}
                                </p>
                            </div>
                            {order.payment_method && (
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {order.payment_method}
                                    </p>
                                </div>
                            )}
                            {order.payment_status && (
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {order.payment_status}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                        
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            {item.product_image || item.image ? (
                                                <Image
                                                    src={item.product_image || item.image}
                                                    alt={item.product_name || item.name || 'Product'}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {item.product_name || item.name || 'Product Name'}
                                            </h3>
                                            <div className="mt-1 text-sm text-gray-600 space-y-1">
                                                {(item.variant_name || item.size) && (
                                                    <p>Size: {item.variant_name || item.size}</p>
                                                )}
                                                <p>Quantity: {item.quantity || 1}</p>
                                                <p>Price: {formatPrice(item.price || item.unit_price)}</p>
                                            </div>
                                        </div>

                                        {/* Line Total */}
                                        <div className="flex-shrink-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatPrice((item.price || item.unit_price) * (item.quantity || 1))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No items found for this order.</p>
                        )}
                    </div>

                    {/* Order Totals */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
                        <div className="space-y-2">
                            {order.subtotal && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                                </div>
                            )}
                            {order.discount && parseFloat(order.discount) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="text-green-600">-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            {order.tax && parseFloat(order.tax) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="text-gray-900">{formatPrice(order.tax)}</span>
                                </div>
                            )}
                            {order.shipping_cost && parseFloat(order.shipping_cost) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="text-gray-900">{formatPrice(order.shipping_cost)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {formatPrice(order.total_amount || order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {(order.shipping_address || order.address || order.delivery_address || shippingAddress) && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                            <div className="text-gray-600">
                                {(() => {
                                    const address = order.shipping_address || order.address || order.delivery_address || shippingAddress;
                                    
                                    // Handle string address
                                    if (typeof address === 'string') {
                                        return <p className="whitespace-pre-line">{address}</p>;
                                    }
                                    
                                    // Handle object address
                                    if (typeof address === 'object' && address !== null) {
                                        return (
                                            <div className="space-y-1">
                                                {address.name && (
                                                    <p className="font-medium text-gray-900">
                                                        {address.name}
                                                    </p>
                                                )}
                                                {address.address && (
                                                    <p>{address.address}</p>
                                                )}
                                                {(address.city || address.state || address.pincode) && (
                                                    <p>
                                                        {address.city}
                                                        {address.state && `, ${address.state}`}
                                                        {address.pincode && ` - ${address.pincode}`}
                                                    </p>
                                                )}
                                                {address.country && (
                                                    <p>{address.country}</p>
                                                )}
                                                {(address.phone_number || address.phone) && (
                                                    <p>Phone: {address.phone_number || address.phone}</p>
                                                )}
                                            </div>
                                        );
                                    }
                                    
                                    return <p className="text-gray-500 italic">Address information not available</p>;
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Show address ID for debugging if no address details found */}
                    {!order.shipping_address && !order.address && !order.delivery_address && !shippingAddress && order.address_id && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-yellow-800 mb-1">
                                Address Information
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Address ID: {order.address_id} (Full address details could not be loaded)
                            </p>
                        </div>
                    )}

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes</h2>
                            <p className="text-gray-600">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrderDetailsPage;
