import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import logo from '../../assets/logo.jpg';

const Header = () => {
  const [totalItems, setTotalItems] = useState(0);
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    const updateCartCount = () => {
      setTotalItems(getTotalItems());
    };

    // Initial count
    updateCartCount();

    // Listen for storage changes (when items are added to cart)
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event dispatched when cart is updated
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [getTotalItems]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 inline-flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                className="w-auto h-7 xl:h-10 rounded-lg" 
                src={logo} 
                alt="Aniga's Attire Logo" 
              />
              <p className="text-xl ml-1.5 mt-0.5 font-bold text-black">
                Aniga's Attire
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
            <Link 
              href="/" 
              className="text-base font-semibold text-black transition-all duration-200 hover:text-orange-600"
            >
              Home
            </Link>
            <Link 
              href="/categories" 
              className="text-base font-semibold text-black transition-all duration-200 hover:text-orange-600"
            >
              Categories
            </Link>
            <Link 
              href="/products" 
              className="text-base font-semibold text-black transition-all duration-200 hover:text-orange-600"
            >
              Products
            </Link>
            <Link 
              href="/about" 
              className="text-base font-semibold text-black transition-all duration-200 hover:text-orange-600"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-base font-semibold text-black transition-all duration-200 hover:text-orange-600"
            >
              Contact
            </Link>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/cart" 
              className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9.5M7 13h10M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8M7 13H5.4M7 13l10 0" 
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button 
              type="button" 
              className="inline-flex p-2 text-black transition-all duration-200 rounded-md lg:hidden focus:bg-gray-100 hover:bg-gray-100"
            >
              <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
