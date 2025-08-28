import api from './axiosInstance';
import Cookie from 'js-cookie';

/**
 * Wishlist API utilities for interacting with Django backend
 * Base URL: /api/wishlist/
 */

/**
 * Get all wishlist items for the authenticated user
 * @returns {Promise} Wishlist items from backend
 */
export const getWishlistItems = async () => {
  try {
    // Try different possible endpoint patterns based on your backend structure
    const endpoints = [
      '/api/ecom/wishlist/',      // E-commerce module endpoint
    ];

    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        return {
          success: true,
          data: response.data.results || response.data || [], // Handle both paginated and non-paginated responses
          error: null
        };
      } catch (error) {
        lastError = error;
        if (error.response?.status === 404) {
          // Continue to next endpoint
          continue;
        } else {
          // If it's not a 404, break and handle the error
          break;
        }
      }
    }

    // If all endpoints failed, check if it's because the feature isn't implemented yet
    if (lastError?.response?.status === 404) {
      // Fallback to localStorage for development
      const localWishlist = typeof window !== 'undefined' ? localStorage.getItem('wishlist') : null;
      const fallbackData = localWishlist ? JSON.parse(localWishlist) : [];
      
      return {
        success: true,
        data: fallbackData,
        error: null,
        fallbackMode: true
      };
    }

    throw lastError;
  } catch (error) {
    console.error('Failed to fetch wishlist items:', error);
    return {
      success: false,
      data: [],
      error: {
        status: error.response?.status,
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch wishlist items',
        data: error.response?.data
      }
    };
  }
};

/**
 * Add a product to wishlist
 * @param {number|string} productId - Product ID to add to wishlist
 * @returns {Promise} Response from backend
 */
export const addToWishlist = async (productId) => {
  try {
    // Try different possible endpoint patterns
    const endpoints = [
      '/api/ecom/wishlist/',
    ];

    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        // Try different payload formats that backends commonly expect
        const payloads = [
          { product_id: productId },
          { product: productId },
          { productId: productId },
          { id: productId }
        ];
        
        let endpointError = null;
        for (const payload of payloads) {
          try {
            const response = await api.post(endpoint, payload);
            return {
              success: true,
              data: response.data,
              error: null
            };
          } catch (payloadError) {
            endpointError = payloadError;
            if (payloadError.response?.status !== 400) {
              // If it's not a 400 error, don't try other payloads for this endpoint
              break;
            }
          }
        }
        
        // If all payloads failed for this endpoint, throw the last error
        throw endpointError;
      } catch (error) {
        lastError = error;
        if (error.response?.status === 404) {
          continue;
        } else {
          break;
        }
      }
    }

    // If all endpoints failed with 404, use localStorage fallback
    if (lastError?.response?.status === 404) {
      if (typeof window !== 'undefined') {
        const existingWishlist = localStorage.getItem('wishlist');
        let wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
        
        // Check if item already exists
        const existingItem = wishlist.find(item => item.id === productId || item.product_id === productId);
        if (existingItem) {
          return {
            success: false,
            data: null,
            error: {
              status: 400,
              message: 'Product already in wishlist',
              data: null
            }
          };
        }
        
        // Add new item (simplified structure for localStorage)
        const newItem = {
          id: Date.now(),
          product_id: productId,
          created_at: new Date().toISOString()
        };
        
        wishlist.push(newItem);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        return {
          success: true,
          data: newItem,
          error: null,
          fallbackMode: true
        };
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to add to wishlist';
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || error.response.data?.message || 'Product already in wishlist';
    } else if (error.response?.status === 401) {
      errorMessage = 'Please login to add items to wishlist';
    } else if (error.response?.status === 404) {
      errorMessage = 'Product not found';
    }
    
    return {
      success: false,
      data: null,
      error: {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      }
    };
  }
};

/**
 * Remove a product from wishlist
 * @param {number|string} wishlistItemId - Wishlist item ID to remove
 * @returns {Promise} Response from backend
 */
export const removeFromWishlist = async (wishlistItemId) => {
  try {
    // Try different possible endpoint patterns
    const endpoints = [
      `/api/ecom/wishlist/${wishlistItemId}/`,
    ];

    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.delete(endpoint);
        return {
          success: true,
          data: response.data,
          error: null
        };
      } catch (error) {
        lastError = error;
        if (error.response?.status === 404 && !endpoint.includes(wishlistItemId)) {
          // If the endpoint itself doesn't exist, try next
          continue;
        } else {
          break;
        }
      }
    }

    // If all endpoints failed with 404, use localStorage fallback
    if (lastError?.response?.status === 404) {
      if (typeof window !== 'undefined') {
        const existingWishlist = localStorage.getItem('wishlist');
        let wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
        
        // Remove item by ID or product_id with priority matching
        const originalLength = wishlist.length;
        const wishlistItemIdStr = String(wishlistItemId);
        
        wishlist = wishlist.filter(item => {
          // Priority matching: product.id > product_id > item.id
          const itemProductObjId = item.product?.id;
          const itemProductId = item.product_id;
          const itemId = item.id;
          
          // Convert all to strings for consistent comparison
          const itemProductObjIdStr = String(itemProductObjId);
          const itemProductIdStr = String(itemProductId);
          const itemIdStr = String(itemId);
          
          // Match priority: product.id first, then product_id, then item.id
          const shouldRemove = (
            (itemProductObjId !== null && itemProductObjId !== undefined && itemProductObjIdStr === wishlistItemIdStr) ||
            (itemProductId !== null && itemProductId !== undefined && itemProductIdStr === wishlistItemIdStr) ||
            (itemId !== null && itemId !== undefined && itemIdStr === wishlistItemIdStr)
          );
          
          return !shouldRemove;
        });
        
        if (wishlist.length < originalLength) {
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          return {
            success: true,
            data: null,
            error: null,
            fallbackMode: true
          };
        } else {
          return {
            success: false,
            data: null,
            error: {
              status: 404,
              message: 'Item not found in wishlist',
              data: null
            }
          };
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    
    let errorMessage = 'Failed to remove from wishlist';
    if (error.response?.status === 401) {
      errorMessage = 'Please login to manage wishlist';
    } else if (error.response?.status === 404) {
      errorMessage = 'Item not found in wishlist';
    }
    
    return {
      success: false,
      data: null,
      error: {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      }
    };
  }
};

/**
 * Check if a product is in the user's wishlist
 * @param {number|string} productId - Product ID to check
 * @param {Array} wishlistItems - Current wishlist items
 * @returns {Object|null} Wishlist item if found, null otherwise
 */
export const findWishlistItem = (productId, wishlistItems) => {
  if (!wishlistItems || !Array.isArray(wishlistItems)) {
    return null;
  }
  
  // Convert search productId to string for consistent comparison
  const productIdStr = String(productId);
  
  const found = wishlistItems.find(item => {
    // We're looking for the item where the actual product ID matches
    // Priority: product.id > product_id > item.id (as last resort)
    const itemProductObjId = item.product?.id;
    const itemProductId = item.product_id;
    const itemId = item.id;
    
    // Convert all to strings for consistent comparison
    const itemProductObjIdStr = String(itemProductObjId);
    const itemProductIdStr = String(itemProductId);
    const itemIdStr = String(itemId);
    
    // Match priority: product.id first, then product_id, then item.id
    const matches = (
      (itemProductObjId !== null && itemProductObjId !== undefined && itemProductObjIdStr === productIdStr) ||
      (itemProductId !== null && itemProductId !== undefined && itemProductIdStr === productIdStr) ||
      (itemId !== null && itemId !== undefined && itemIdStr === productIdStr)
    );
    
    return matches;
  });
  
  return found || null;
};

/**
 * Check if user is authenticated for wishlist operations
 * @returns {boolean} True if user has valid JWT token
 */
export const isWishlistAuthValid = () => {
  const token = Cookie.get('accessToken');
  return !!token;
};

/**
 * Handle authentication error for wishlist operations
 * @param {Function} redirectToLogin - Function to redirect to login page
 */
export const handleWishlistAuthError = (redirectToLogin) => {
  if (typeof window !== 'undefined') {
    // Store the current page to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    if (redirectToLogin && typeof redirectToLogin === 'function') {
      redirectToLogin();
    } else {
      window.location.href = '/login';
    }
  }
};

/**
 * Migrate localStorage wishlist to backend (for existing users)
 * @returns {Promise} Migration result
 */
export const migrateLocalWishlistToBackend = async () => {
  try {
    if (typeof window === 'undefined' || !isWishlistAuthValid()) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const localWishlist = localStorage.getItem('wishlist');
    if (!localWishlist) {
      return { success: true, message: 'No local wishlist to migrate' };
    }
    
    const localItems = JSON.parse(localWishlist);
    if (!Array.isArray(localItems) || localItems.length === 0) {
      return { success: true, message: 'No items to migrate' };
    }
    
    // Get current backend wishlist to avoid duplicates
    const backendResult = await getWishlistItems();
    const backendItems = backendResult.success ? backendResult.data : [];
    
    // Add local items that don't exist in backend
    const migrationPromises = localItems.map(async (localItem) => {
      const productId = localItem.id || localItem.product_id;
      const existsInBackend = findWishlistItem(productId, backendItems);
      
      if (!existsInBackend && productId) {
        return await addToWishlist(productId);
      }
      return { success: true, skipped: true };
    });
    
    const results = await Promise.all(migrationPromises);
    const successCount = results.filter(r => r.success && !r.skipped).length;
    
    // Clear localStorage after successful migration
    if (successCount > 0) {
      localStorage.removeItem('wishlist');
    }
    
    return {
      success: true,
      migrated: successCount,
      total: localItems.length,
      message: `Migrated ${successCount} items to your account`
    };
  } catch (error) {
    console.error('Failed to migrate local wishlist:', error);
    return {
      success: false,
      error: 'Failed to migrate wishlist items'
    };
  }
};

export default {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  findWishlistItem,
  isWishlistAuthValid,
  handleWishlistAuthError,
  migrateLocalWishlistToBackend
};
