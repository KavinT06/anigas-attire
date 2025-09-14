import api from '../utils/axiosInstance';
import Cookie from 'js-cookie';

/**
 * Wishlist Service for managing user wishlist operations
 * Handles both backend API calls and localStorage fallback
 */

/**
 * Get all wishlist items for the authenticated user
 * @returns {Promise<Object>} Wishlist items from backend or localStorage
 */
export const getWishlistItems = async () => {
  try {
    const response = await api.get('/api/ecom/wishlist/');
    return {
      success: true,
      data: response.data.results || response.data || [],
      error: null
    };
  } catch (error) {
    console.error('Failed to fetch wishlist items:', error);

    // Fallback to localStorage for offline mode
    if (error.response?.status === 404 && typeof window !== 'undefined') {
      const localWishlist = localStorage.getItem('wishlist');
      const fallbackData = localWishlist ? JSON.parse(localWishlist) : [];
      
      return {
        success: true,
        data: fallbackData,
        error: null,
        fallbackMode: true
      };
    }

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
 * @returns {Promise<Object>} Response from backend or localStorage
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/api/ecom/wishlist/', { 
      product: productId 
    });
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Failed to add to wishlist:', error);

    // Fallback to localStorage for offline mode
    if (error.response?.status === 404 && typeof window !== 'undefined') {
      const existingWishlist = localStorage.getItem('wishlist');
      let wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
      
      // Check if item already exists
      const existingItem = wishlist.find(item => 
        item.id === productId || item.product_id === productId
      );
      
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
      
      // Add new item
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
 * @returns {Promise<Object>} Response from backend or localStorage
 */
export const removeFromWishlist = async (wishlistItemId) => {
  try {
    const response = await api.delete(`/api/ecom/wishlist/${wishlistItemId}/`);
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);

    // Fallback to localStorage for offline mode
    if (error.response?.status === 404 && typeof window !== 'undefined') {
      const existingWishlist = localStorage.getItem('wishlist');
      let wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
      
      const originalLength = wishlist.length;
      const wishlistItemIdStr = String(wishlistItemId);
      
      // Remove item by matching product_id or item id
      wishlist = wishlist.filter(item => {
        const itemProductId = String(item.product?.id || item.product_id || item.id);
        return itemProductId !== wishlistItemIdStr;
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
  
  const productIdStr = String(productId);
  
  return wishlistItems.find(item => {
    const itemProductId = String(item.product?.id || item.product_id || item.id);
    return itemProductId === productIdStr;
  }) || null;
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
 * @returns {Promise<Object>} Migration result
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
    const migrationResults = [];
    for (const localItem of localItems) {
      const productId = localItem.id || localItem.product_id;
      const existsInBackend = findWishlistItem(productId, backendItems);
      
      if (!existsInBackend && productId) {
        const result = await addToWishlist(productId);
        migrationResults.push(result);
      }
    }
    
    const successCount = migrationResults.filter(r => r.success).length;
    
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

const wishlistService = {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  findWishlistItem,
  isWishlistAuthValid,
  handleWishlistAuthError,
  migrateLocalWishlistToBackend
};

export default wishlistService;
