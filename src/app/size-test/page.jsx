"use client";

import React, { useState } from 'react';

export default function SizeTestPage() {
    const [selectedSize, setSelectedSize] = useState('');

    // Test function that mimics our React logic
    const getAvailableSizes = (product) => {
        console.log('Product data for sizes:', product);
        
        // If backend provides sizes in product.variants array (most common case)
        if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            const sizes = product.variants.map(variant => variant.name).filter(Boolean);
            console.log('Extracted sizes from variants:', sizes);
            return sizes;
        }
        
        // If backend provides sizes in product.sizes array
        if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            console.log('Using product.sizes:', product.sizes);
            return product.sizes;
        }
        
        // If backend provides sizes in product.available_sizes
        if (product?.available_sizes && Array.isArray(product.available_sizes) && product.available_sizes.length > 0) {
            console.log('Using product.available_sizes:', product.available_sizes);
            return product.available_sizes;
        }
        
        // If backend provides sizes in product.variant_names
        if (product?.variant_names && Array.isArray(product.variant_names) && product.variant_names.length > 0) {
            console.log('Using product.variant_names:', product.variant_names);
            return product.variant_names;
        }
        
        console.log('Using fallback sizes - no size data found in backend');
        // Fallback to include S-size in case backend doesn't provide size data
        return ['S', 'M', 'L', 'XL', 'XXL'];
    };

    // Test different product scenarios
    const testProducts = [
        {
            id: 1,
            name: "Product with S-size",
            variants: [
                { name: "S", price: 350 },
                { name: "M", price: 350 },
                { name: "L", price: 350 },
                { name: "XL", price: 350 }
            ]
        },
        {
            id: 2,
            name: "Product without S-size",
            variants: [
                { name: "M", price: 350 },
                { name: "L", price: 350 },
                { name: "XL", price: 350 },
                { name: "XXL", price: 350 }
            ]
        },
        {
            id: 3,
            name: "Product with direct sizes array",
            sizes: ["XS", "S", "M", "L", "XL"]
        },
        {
            id: 4,
            name: "Product with available_sizes",
            available_sizes: ["S", "M", "L"]
        },
        {
            id: 5,
            name: "Product with no size data",
            description: "No size info"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Size Logic Test</h1>
                
                {testProducts.map((product, index) => {
                    const availableSizes = getAvailableSizes(product);
                    
                    return (
                        <div key={product.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Test {index + 1}: {product.name}
                            </h2>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Available Sizes: <span className="font-medium">{availableSizes.join(', ')}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Has S-size: <span className={`font-medium ${availableSizes.includes('S') ? 'text-green-600' : 'text-red-600'}`}>
                                        {availableSizes.includes('S') ? 'YES' : 'NO'}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Size Selection Demo:
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {availableSizes.map((size) => (
                                        <button
                                            key={`${product.id}-${size}`}
                                            onClick={() => setSelectedSize(`${product.id}-${size}`)}
                                            className={`px-6 py-3 text-sm font-medium border-2 rounded-lg transition-all duration-200 ${
                                                selectedSize === `${product.id}-${size}`
                                                    ? 'border-orange-500 bg-orange-500 text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">
                                    Backend data: {JSON.stringify(product, null, 2)}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• First checks product.variants[].name (most common)</li>
                        <li>• Then checks product.sizes array</li>
                        <li>• Then checks product.available_sizes array</li>
                        <li>• Then checks product.variant_names array</li>
                        <li>• Falls back to ['S', 'M', 'L', 'XL', 'XXL'] if no size data found</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
