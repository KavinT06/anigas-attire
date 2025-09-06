import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addToCart: (product, selectedSize, quantity = 1) => {
        set((state) => {
          const itemId = `${product.id}-${selectedSize}`;
          const existingItemIndex = state.items.findIndex(item => item.id === itemId);
          
          if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          } else {
            // Add new item
            const newItem = {
              id: itemId,
              productId: product.id,
              name: product.name,
              price: parseFloat(product.start_price) || 0,
              image: product.images && product.images.length > 0 
                ? product.images[0].image_url 
                : null,
              size: selectedSize,
              quantity,
              category: product.category_name || product.category || '',
            };
            return { items: [...state.items, newItem] };
          }
        });
      },
      
      // Remove item from cart
      removeFromCart: (productId, selectedSize) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== `${productId}-${selectedSize}`)
        }));
      },
      
      // Update item quantity
      updateQuantity: (productId, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedSize);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item => 
            item.id === `${productId}-${selectedSize}` 
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      // Clear entire cart
      clearCart: () => set({ items: [] }),
      
      // Get total items count
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get total price
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      // Get item count by product id and size
      getItemQuantity: (productId, selectedSize) => {
        const { items } = get();
        const item = items.find(item => item.id === `${productId}-${selectedSize}`);
        return item ? item.quantity : 0;
      }
    }),
    {
      name: 'anigas-cart-storage', // localStorage key
      getStorage: () => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
);

export default useCartStore;
