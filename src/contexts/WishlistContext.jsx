"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWishlistItems, 
  addToWishlist, 
  removeFromWishlist, 
  findWishlistItem,
  migrateLocalWishlistToBackend,
  isWishlistAuthValid 
} from '../utils/wishlistApi';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { isLoggedIn } = useAuth();

  // Load wishlist when user logs in
  useEffect(() => {
    if (isLoggedIn && isWishlistAuthValid()) {
      loadWishlist();
    } else if (!isLoggedIn) {
      // Clear wishlist when user logs out
      setWishlistItems([]);
      setInitialized(false);
    }
  }, [isLoggedIn]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (isLoggedIn && isWishlistAuthValid()) {
        loadWishlist();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('authChanged', handleAuthChange);
      return () => window.removeEventListener('authChanged', handleAuthChange);
    }
  }, [isLoggedIn]);

  /**
   * Load wishlist items from backend
   */
  const loadWishlist = async (showLoading = true) => {
    if (!isWishlistAuthValid()) {
      setWishlistItems([]);
      setInitialized(true);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      const result = await getWishlistItems();
      
      if (result.success) {
        setWishlistItems(result.data || []);
        setFallbackMode(result.fallbackMode || false);
        
        // Show info about fallback mode
        if (result.fallbackMode && !initialized) {
          toast.info('Using offline wishlist mode. Items will sync when backend is ready.', {
            duration: 4000,
            icon: '💾'
          });
        }
        
        // Attempt to migrate local wishlist on first load (only if not in fallback mode)
        if (!initialized && !result.fallbackMode) {
          try {
            await migrateLocalWishlistToBackend();
            // Reload wishlist after migration
            const updatedResult = await getWishlistItems();
            if (updatedResult.success) {
              setWishlistItems(updatedResult.data || []);
            }
          } catch (migrationError) {
            console.warn('Wishlist migration failed:', migrationError);
          }
        }
      } else {
        console.error('Failed to load wishlist:', result.error);
        
        // Handle specific error cases
        if (result.error?.status === 401) {
          // Token expired or invalid, clear state
          setWishlistItems([]);
        } else if (result.error?.status === 404) {
          // Endpoint not found, but don't show error to user
          console.warn('Wishlist endpoint not implemented yet. Consider adding it to your Django backend.');
          setWishlistItems([]);
          setFallbackMode(true);
        } else {
          // Other errors, show to user
          toast.error(result.error?.message || 'Failed to load wishlist');
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Don't show error toast for 404s (endpoint not implemented)
      if (error.response?.status !== 404) {
        toast.error('Failed to load wishlist');
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  /**
   * Add product to wishlist
   */
  const addItemToWishlist = async (productId, productData = null) => {
    if (!isWishlistAuthValid()) {
      toast.error('Please login to add items to wishlist');
      return { success: false, error: 'Not authenticated' };
    }

    // Check if already in wishlist
    const existingItem = findWishlistItem(productId, wishlistItems);
    if (existingItem) {
      toast.info('Item already in wishlist');
      return { success: true, alreadyExists: true };
    }

    try {
      setLoading(true);
      
      const result = await addToWishlist(productId);
      
      if (result.success) {
        // Add to local state immediately for better UX
        let newItem = result.data;
        
        // If we're in fallback mode or the backend doesn't return full product data
        if (result.fallbackMode || !newItem.product) {
          newItem = {
            ...newItem,
            product_id: productId,
            product: productData,
            created_at: newItem.created_at || new Date().toISOString()
          };
        }
        
        setWishlistItems(prev => [...prev, newItem]);
        
        const message = result.fallbackMode 
          ? 'Added to wishlist (offline mode)' 
          : 'Added to wishlist';
        
        toast.success(message, {
          icon: '❤️',
          duration: 2000,
        });
        
        // Refresh from backend to get correct data (only if not in fallback mode)
        if (!result.fallbackMode) {
          setTimeout(() => loadWishlist(false), 500);
        }
        
        return { success: true, data: newItem };
      } else {
        const message = result.error?.message || 'Failed to add to wishlist';
        toast.error(message);
        return result;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove product from wishlist
   */
  const removeItemFromWishlist = async (productId) => {
    if (!isWishlistAuthValid()) {
      toast.error('Please login to manage wishlist');
      return { success: false, error: 'Not authenticated' };
    }

    const wishlistItem = findWishlistItem(productId, wishlistItems);
    if (!wishlistItem) {
      toast.info('Item not found in wishlist');
      return { success: true, notFound: true };
    }

    try {
      setLoading(true);
      
      // Store original items for potential rollback
      const originalItems = wishlistItems;
      
      // Remove from local state immediately for better UX (optimistic update)
      const productIdStr = String(productId);
      
      const filteredItems = originalItems.filter(item => {
        // Match by product ID with priority: product.id > product_id > item.id
        const itemProductObjId = item.product?.id;
        const itemProductId = item.product_id;
        const itemId = item.id;
        
        // Convert all to strings for consistent comparison, handle null/undefined
        const itemProductObjIdStr = itemProductObjId ? String(itemProductObjId) : null;
        const itemProductIdStr = itemProductId ? String(itemProductId) : null;
        const itemIdStr = itemId ? String(itemId) : null;
        
        // Match priority: product.id first, then product_id, then item.id
        const shouldRemove = (
          (itemProductObjIdStr && itemProductObjIdStr === productIdStr) ||
          (itemProductIdStr && itemProductIdStr === productIdStr) ||
          (itemIdStr && itemIdStr === productIdStr)
        );
        
        return !shouldRemove;
      });
      
      setWishlistItems(filteredItems);
      
      // Use the most appropriate ID for removal - try the item's actual ID first
      const itemId = wishlistItem.id || wishlistItem.product_id || productId;
      
      const result = await removeFromWishlist(itemId);
      
      if (result.success) {
        const message = result.fallbackMode 
          ? 'Removed from wishlist (offline mode)' 
          : 'Removed from wishlist';
        
        toast.success(message, {
          icon: '💔',
          duration: 2000,
        });
        
        return { success: true };
      } else {
        // Revert local state if backend call failed
        setWishlistItems(originalItems);
        toast.error(result.error?.message || 'Failed to remove from wishlist');
        return result;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Revert local state if error occurred
      setWishlistItems(originalItems);
      toast.error('Failed to remove from wishlist');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   */
  const toggleWishlistItem = async (productId, productData = null) => {
    const existingItem = findWishlistItem(productId, wishlistItems);
    
    if (existingItem) {
      return await removeItemFromWishlist(productId);
    } else {
      return await addItemToWishlist(productId, productData);
    }
  };

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = (productId) => {
    return !!findWishlistItem(productId, wishlistItems);
  };

  /**
   * Get wishlist item count
   */
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  /**
   * Clear entire wishlist (for testing/admin purposes)
   */
  const clearWishlist = async () => {
    if (!isWishlistAuthValid()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      // Remove all items
      const removePromises = wishlistItems.map(item => 
        removeFromWishlist(item.id)
      );
      
      await Promise.all(removePromises);
      setWishlistItems([]);
      
      toast.success('Wishlist cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    // State
    wishlistItems,
    loading,
    initialized,
    fallbackMode,
    
    // Actions
    loadWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    toggleWishlistItem,
    clearWishlist,
    
    // Utilities
    isInWishlist,
    getWishlistCount,
    findWishlistItem: (productId) => findWishlistItem(productId, wishlistItems)
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
