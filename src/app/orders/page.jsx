"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getOrders } from '../../services/api/orders';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
    });

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getOrders({ page });
            
            if (result.success) {
                setOrders(result.data.results || result.data || []);
                
                // Handle pagination data
                if (result.data.count !== undefined) {
                    // Django pagination format
                    const totalCount = result.data.count;
                    const pageSize = result.data.results?.length || 10;
                    const totalPages = Math.ceil(totalCount / pageSize);
                    
                    setPagination({
                        currentPage: page,
                        totalPages,
                        hasNext: !!result.data.next,
                        hasPrevious: !!result.data.previous
                    });
                } else {
                    // Simple array response
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        hasNext: false,
                        hasPrevious: false
                    });
                }
            } else {
                setError(result.error?.message || 'Failed to fetch orders');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Orders fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
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
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders. Start shopping to see your orders here.</p>
            <Link 
                href="/products" 
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
                Start Shopping
            </Link>
        </div>
    );

    const ErrorState = () => (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
                onClick={() => fetchOrders(pagination.currentPage)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="mt-2 text-gray-600">Track and manage your orders</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-lg shadow">
                        {loading && <div className="p-6"><LoadingSkeleton /></div>}
                        
                        {error && !loading && <div className="p-6"><ErrorState /></div>}
                        
                        {!loading && !error && orders.length === 0 && <div className="p-6"><EmptyState /></div>}
                        
                        {!loading && !error && orders.length > 0 && (
                            <>
                                {/* Orders List - Mobile */}
                                <div className="block sm:hidden">
                                    <div className="divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            Order #{order.id || order.order_id}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatDate(order.created_at || order.created)}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {formatPrice(order.total_amount || order.total)}
                                                    </p>
                                                    <Link 
                                                        href={`/orders/${order.id || order.order_id}`}
                                                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                                {order.payment_method && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        Payment: {order.payment_method}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Orders List - Desktop */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{order.id || order.order_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(order.created_at || order.created)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {formatPrice(order.total_amount || order.total)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {order.payment_method || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <Link 
                                                            href={`/orders/${order.id || order.order_id}`}
                                                            className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrevious}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrdersPage;
