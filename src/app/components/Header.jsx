"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';
import { logout } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

const Header = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { getTotalItems } = useCartStore();
  const { isLoggedIn, user, mounted, getUserDisplayName, getUserAvatar } = useAuth();

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
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [getTotalItems]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
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
              </Link>
              <div className="w-px h-5 bg-black/20"></div>
              <div className="w-20 h-10 border-2 border-gray-300 rounded animate-pulse"></div> {/* Placeholder for auth button */}
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

          <button 
            type="button" 
            onClick={toggleMobileMenu}
            className="inline-flex p-1 text-black transition-all duration-200 border border-black lg:hidden focus:bg-gray-100 hover:bg-gray-100"
          >
            <svg 
              className={`w-6 h-6 ${showMobileMenu ? 'hidden' : 'block'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg 
              className={`w-6 h-6 ${showMobileMenu ? 'block' : 'hidden'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Desktop Navigation */}
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

            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-black hover:text-orange-500 transition-colors duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserAvatar()}
                  </div>
                  <span className="text-base font-semibold">
                    👋 Hi, {getUserDisplayName()}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link 
                      href="/account/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      📦 Orders
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      ❤️ Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-5 py-2.5 text-base font-semibold text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 focus:bg-black focus:text-white"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link 
                href="/" 
                className="block px-3 py-2 text-base font-medium text-black hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                href="/categories" 
                className="block px-3 py-2 text-base font-medium text-black hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Categories
              </Link>
              <Link 
                href="/products" 
                className="block px-3 py-2 text-base font-medium text-black hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Products
              </Link>
              <Link 
                href="/cart" 
                className="flex items-center justify-between px-3 py-2 text-base font-medium text-black hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                <span className="flex items-center space-x-2">
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
                </span>
                {totalItems > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              
              <div className="border-t border-gray-200 pt-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center px-3 py-2 mb-2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {getUserAvatar()}
                      </div>
                      <span className="text-base font-medium text-black">
                        👋 Hi, {getUserDisplayName()}
                      </span>
                    </div>
                    <Link 
                      href="/account/orders" 
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      📦 Orders
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      ❤️ Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors duration-200 text-center"
                    onClick={closeMobileMenu}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for dropdown/mobile menu */}
      {(showDropdown || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowDropdown(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
