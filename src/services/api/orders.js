import api from '../../utils/axiosInstance';
import { ECOM_ENDPOINTS } from '../../utils/apiConfig';

/**
 * Orders API service
 * Handles all order-related API calls to Django backend
 */

/**
 * Get all orders for the current user
 * @param {Object} params - Query parameters for pagination
 * @returns {Promise} Orders list response
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get(ECOM_ENDPOINTS.orders, { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch orders',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Get order details by ID
 * @param {string|number} orderId - Order ID
 * @returns {Promise} Order details response
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`${ECOM_ENDPOINTS.orders}${orderId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch order details',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order creation data
 * @returns {Promise} Order creation response
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post(ECOM_ENDPOINTS.orders, orderData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to create order',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Get user's cart
 * @returns {Promise} Cart response
 */
export const getCart = async () => {
  try {
    const response = await api.get(ECOM_ENDPOINTS.cart);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch cart',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Add item to cart
 * @param {Object} itemData - Item data to add to cart
 * @returns {Promise} Add to cart response
 */
export const addToCart = async (itemData) => {
  try {
    const response = await api.post(ECOM_ENDPOINTS.cart, itemData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to add to cart',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Update cart item quantity
 * @param {string|number} variantId - Variant ID or cart item ID
 * @param {Object} updateData - Update data (quantity, etc.)
 * @returns {Promise} Update cart response
 */
export const updateCartItem = async (variantId, updateData) => {
  try {
    const response = await api.put(`${ECOM_ENDPOINTS.cart}${variantId}/`, updateData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to update cart item',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Remove item from cart
 * @param {string|number} variantId - Variant ID or cart item ID
 * @returns {Promise} Remove from cart response
 */
export const removeFromCart = async (variantId) => {
  try {
    const response = await api.delete(`${ECOM_ENDPOINTS.cart}${variantId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to remove from cart',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Get user addresses
 * @returns {Promise} Addresses response
 */
export const getAddresses = async () => {
  try {
    const response = await api.get(ECOM_ENDPOINTS.address);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch addresses',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Create new address
 * @param {Object} addressData - Address creation data
 * @returns {Promise} Address creation response
 */
export const createAddress = async (addressData) => {
  try {
    const response = await api.post(ECOM_ENDPOINTS.address, addressData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating address:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to create address',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Initiate payment process
 * @param {Object} paymentData - Payment initiation data
 * @returns {Promise} Payment response
 */
export const initiatePayment = async (paymentData) => {
  try {
    const response = await api.post(ECOM_ENDPOINTS.payment, paymentData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to initiate payment',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Get payment status/details
 * @param {Object} params - Payment query parameters
 * @returns {Promise} Payment status response
 */
export const getPaymentStatus = async (params = {}) => {
  try {
    const response = await api.get(ECOM_ENDPOINTS.payment, { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch payment status',
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};
