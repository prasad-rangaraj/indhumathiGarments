import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/contexts/CartContext';
import { cartAPI } from '@/lib/api';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, size: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

const getUserId = (): string => {
  const { user } = useAuthStore.getState();
  return user?.id || 'guest';
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      loading: false,
      error: null,

      fetchCart: async () => {
        const userId = getUserId();
        if (userId === 'guest') {
          // For guests, keep local storage items
          const localItems = get().items;
          const total = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ total });
          return;
        }
        
        set({ loading: true, error: null });
        try {
          const cartItems = await cartAPI.get(userId);
          const items: CartItem[] = cartItems.map((item: any) => ({
            ...item.product,
            quantity: item.quantity,
            selectedSize: item.size,
            id: `${item.product.id}-${item.size}`,
            cartItemId: item.id, // Store backend cart item ID for updates/deletes
          }));
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ items, total, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch cart', loading: false });
        }
      },

      addItem: async (product: Product, size: string) => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          // Always make individual API call (no batching)
          const existingItem = get().items.find(
            item => item.id === product.id && item.selectedSize === size
          );

          if (userId !== 'guest') {
            if (existingItem && (existingItem as any).cartItemId) {
              // Item exists, update quantity via API
              const newQuantity = existingItem.quantity + 1;
              await cartAPI.update((existingItem as any).cartItemId, newQuantity);
              
              // Update local state
              const updatedItems = get().items.map(item =>
                item.id === product.id && item.selectedSize === size
                  ? { ...item, quantity: newQuantity }
                  : item
              );
              const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
              set({ items: updatedItems, total, loading: false });
            } else {
              // New item, add via API
              const result = await cartAPI.add({
                userId,
                productId: product.id,
                quantity: 1,
                size,
              });
              
              // Update local state
              const newItem: CartItem = {
                ...product,
                quantity: 1,
                selectedSize: size,
                cartItemId: result.id,
              };
              const updatedItems = [...get().items, newItem];
              const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
              set({ items: updatedItems, total, loading: false });
            }
          } else {
            // Guest user - update local state only
            let updatedItems: CartItem[];
            if (existingItem) {
              updatedItems = get().items.map(item =>
                item.id === product.id && item.selectedSize === size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
            } else {
              const newItem: CartItem = {
                ...product,
                quantity: 1,
                selectedSize: size,
              };
              updatedItems = [...get().items, newItem];
            }
            const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            set({ items: updatedItems, total, loading: false });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add item', loading: false });
        }
      },

      removeItem: async (id: string) => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest') {
            // Find the item to get its cartItemId
            const item = get().items.find(item => item.id === id);
            if (item && (item as any).cartItemId) {
              await cartAPI.remove((item as any).cartItemId);
            }
          }
          
          const updatedItems = get().items.filter(item => item.id !== id);
          const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ items: updatedItems, total, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove item', loading: false });
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest' && quantity > 0) {
            // Find the item to get its cartItemId
            const item = get().items.find(item => item.id === id);
            if (item && (item as any).cartItemId) {
              await cartAPI.update((item as any).cartItemId, quantity);
            }
          }
          
          const updatedItems = get().items
            .map(item =>
              item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            )
            .filter(item => item.quantity > 0);
          
          const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ items: updatedItems, total, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update quantity', loading: false });
        }
      },

      clearCart: async () => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest') {
            await cartAPI.clear(userId);
          }
          set({ items: [], total: 0, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear cart', loading: false });
        }
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

