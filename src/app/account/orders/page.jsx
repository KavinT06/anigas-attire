"use client";

import React from 'react';

export default function OrdersPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        My Orders
                    </h1>
                    <p className="text-gray-600">
                        Welcome! You have successfully logged in. This is your orders page.
                    </p>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800">
                            🎉 Login successful! Your JWT token has been stored in localStorage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
