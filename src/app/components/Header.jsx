"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import { isAuthenticated, logout } from '../../utils/auth';
import logo from '../../assets/logo.jpg';

const Header = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
    
    const updateCartCount = () => {
      setTotalItems(getTotalItems());
    };

    const checkAuthStatus = () => {
      const authStatus = isAuthenticated();
      setIsUserAuthenticated(authStatus);
    };

    // Initial count and auth check
    updateCartCount();
    checkAuthStatus();

    // Listen for storage changes (when items are added to cart or auth changes)
    const handleStorageChange = () => {
      updateCartCount();
      checkAuthStatus();
    };

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, [getTotalItems]);

  const handleLogout = () => {
    logout();
    setIsUserAuthenticated(false);
  };

  // Don't render auth-dependent content until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <header className="">
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex-shrink-0 inline-flex">
              <Link href="/" className="flex">
                <Image className="w-auto h-7 xl:h-10 xl:ml-28 rounded-lg" src={logo} alt="" />
              </Link>
              <p className='text-xl ml-1.5 mt-0.5 font-bold text-black'>Aniga's Attire</p>
            </div>
            <button type="button" className="inline-flex p-1 text-black transition-all duration-200 border border-black lg:hidden focus:bg-gray-100 hover:bg-gray-100">
              <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
              <Link href="/" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Home</Link>
              <Link href="/categories" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Categories</Link>
              <Link href="/products" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">Products</Link>
              <div className="w-px h-5 bg-black/20"></div>
              <div className="w-16 h-6"></div> {/* Placeholder for auth button */}
              <Link href="/categories" className="inline-flex items-center justify-center px-5 py-2.5 text-base font-semibold text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 focus:bg-black focus:text-white">Browse Categories</Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="">
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex-shrink-0 inline-flex">
            <Link href="/" className="flex">
              <Image className="w-auto h-7 xl:h-10 xl:ml-28 rounded-lg" src={logo} alt="" />
            </Link>
            <p className='text-xl ml-1.5 mt-0.5 font-bold text-black'>Aniga's Attire</p>
          </div>

          <button type="button" className="inline-flex p-1 text-black transition-all duration-200 border border-black lg:hidden focus:bg-gray-100 hover:bg-gray-100">
            {/* Menu open: "hidden", Menu closed: "block" */}
            <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            {/* Menu open: "block", Menu closed: "hidden" */}
            <svg className="hidden w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
            <Link href="/" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">
              Home
            </Link>

            <Link href="/categories" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">
              Categories
            </Link>

            <Link href="/products" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">
              Products
            </Link>

            <Link 
              href="/cart" 
              className="relative text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80 flex items-center space-x-1"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9.5M7 13h10" 
                />
              </svg>
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <div className="w-px h-5 bg-black/20"></div>

            {isUserAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"
              >
                Log out
              </button>
            ) : (
              <Link href="/login" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80">
                Log in
              </Link>
            )}

            <Link href="/categories" className="inline-flex items-center justify-center px-5 py-2.5 text-base font-semibold text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 focus:bg-black focus:text-white" role="button">
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
