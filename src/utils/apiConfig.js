/**
 * API Configuration for Anigas Attire Backend
 * Centralized endpoint configuration based on Django backend structure
 */

import { env } from 'next-runtime-env';

// Base URL configuration
export const API_BASE_URL = env('NEXT_PUBLIC_BACKEND_URL') || "http://localhost:5025";

// Main API modules
export const API_MODULES = {
  auth: `${API_BASE_URL}/api/auth/`,
  ecom: `${API_BASE_URL}/api/ecom/`,
  authentication: `${API_BASE_URL}/api/authentication/`
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login/`,
  refresh: `${API_BASE_URL}/api/auth/refresh/`,
  sendOtp: `${API_BASE_URL}/api/auth/send-otp/`,
  me: `${API_BASE_URL}/api/auth/me/` // If available
};

// E-commerce endpoints
export const ECOM_ENDPOINTS = {
  categories: `${API_BASE_URL}/api/ecom/categories/`,
  products: `${API_BASE_URL}/api/ecom/products/`,
  categoryProducts: `${API_BASE_URL}/api/ecom/category-products/`,
  wishlist: `${API_BASE_URL}/api/ecom/wishlist/`,
  coupon: `${API_BASE_URL}/api/ecom/coupon/`,
  address: `${API_BASE_URL}/api/ecom/address/`,
  cart: `${API_BASE_URL}/api/ecom/cart/`,
  orders: `${API_BASE_URL}/api/ecom/orders/`,
  payment: `${API_BASE_URL}/api/ecom/payment/`
};

// Alternative authentication endpoints
export const AUTHENTICATION_ENDPOINTS = {
  refresh: `${API_BASE_URL}/api/authentication/refresh/`
};

// Helper functions to build dynamic URLs
export const buildApiUrl = (module, endpoint, params = {}) => {
  let url = `${API_MODULES[module]}${endpoint}`;

  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });

  return url;
};

// Specific endpoint builders
export const getProductUrl = (productId) => `${ECOM_ENDPOINTS.products}${productId}/`;
export const getCategoryProductsUrl = (categoryId) => `${ECOM_ENDPOINTS.categoryProducts}${categoryId}/`;
export const getWishlistItemUrl = (itemId) => `${ECOM_ENDPOINTS.wishlist}${itemId}/`;
export const getOrderUrl = (orderId) => `${ECOM_ENDPOINTS.orders}${orderId}/`;

// Endpoint validation
export const isValidEndpoint = (url) => {
  return url && url.startsWith(API_BASE_URL);
};

// Default headers for API requests
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

// Export all endpoints in a single object for easy access
export const ALL_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...ECOM_ENDPOINTS,
  ...AUTHENTICATION_ENDPOINTS
};

const apiConfig = {
  API_BASE_URL,
  API_MODULES,
  AUTH_ENDPOINTS,
  ECOM_ENDPOINTS,
  AUTHENTICATION_ENDPOINTS,
  ALL_ENDPOINTS,
  buildApiUrl,
  getProductUrl,
  getCategoryProductsUrl,
  getWishlistItemUrl,
  getOrderUrl,
  isValidEndpoint,
  getDefaultHeaders
};

export default apiConfig;
